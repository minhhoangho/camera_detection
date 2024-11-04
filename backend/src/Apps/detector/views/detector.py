import json
import uuid
from typing import AsyncGenerator

from channels.layers import get_channel_layer
import asyncio
from django.http import StreamingHttpResponse
from requests import Request
from rest_framework import viewsets
from rest_framework.decorators import action
from vidgear.gears import CamGear
import os
from django.conf import settings
import cv2
import requests
import numpy as np

from src.Apps.base.utils.type_utils import TypeUtils
from src.Apps.detector.services.detection_util import Yolov8Detector, ObjectDetectionResult
import time

from src.Apps.gis_map.models import GisViewPointCamera, GisViewPoint

detector = Yolov8Detector(os.path.join(settings.BASE_DIR, "../models", "yolov8s.pt"))
from src.Apps.base.constants.http import HttpMethod
from src.Apps.websocket.shared_state import connection_status


class DetectorViewSet(viewsets.ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @action(methods=[HttpMethod.GET], url_path="video/realtime/raw", detail=False)
    def view_raw_realtime(self, request: Request, *args, **kwargs):
        video_url = TypeUtils.safe_str(request.query_params.get("uri"))
        return StreamingHttpResponse(self.handle_frames(video_url, view_raw=True),
                                     content_type="multipart/x-mixed-replace; boundary=frame")

    def handle_frames(self, video_url: str, view_raw=False):
        cap = CamGear(source=video_url, stream_mode=True, logging=True).start()  # YouTube Video URL as input

        # Define the desired frame rate (frames per second)
        frame_rate = 90
        # Calculate the delay between frames
        delay = 1 / frame_rate
        while True:
            frame = cap.read()
            if frame is None:
                break
            if not view_raw:
                frame, results = detector.get_prediction_sahi(frame=frame)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(delay)

    # @gzip.gzip_page
    @action(methods=[HttpMethod.GET], url_path="video/realtime", detail=False)
    def detect_video_realtime(self, request: Request, *args, **kwargs):
        cam_id = TypeUtils.safe_str(request.query_params.get("cam_id"))
        response = StreamingHttpResponse(self.process_video(cam_id, request),
                                         content_type="multipart/x-mixed-replace; boundary=frame")
        response['Connection'] = 'keep-alive'
        response['Accept-Ranges'] = 'bytes'

        return response

    async def process_video(self, cam_id: int, request) -> AsyncGenerator[bytes, None]:
        request_id = str(uuid.uuid4())
        unique_id = f"{request_id}_{cam_id}"

        camera_viewpoint = await GisViewPointCamera.objects.filter(id=cam_id).afirst()
        view_point = await GisViewPoint.objects.filter(id=camera_viewpoint.view_point_id).afirst()
        video_url = camera_viewpoint.camera_uri
        homography_matrix = camera_viewpoint.homography_matrix
        mapping_bev = False
        bev_image = None
        if homography_matrix:
            mapping_bev = True
            homography_matrix = json.loads(homography_matrix)
            homography_matrix = np.array(homography_matrix)
        if camera_viewpoint.bev_image:
            response = requests.get(camera_viewpoint.bev_image)
            img_array = np.array(bytearray(response.content), dtype=np.uint8)
            bev_image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        else:
            mapping_bev = False
        cap = CamGear(source=video_url, stream_mode=True, logging=True).start()  # YouTube Video URL as input
        # Define the desired frame rate (frames per second)
        frame_rate = 90
        # Calculate the delay between frames
        delay = 1 / frame_rate
        channel_layer = get_channel_layer()
        try:
            while True:

                # if not request.is_running():  # Check if the request is still valid
                #     print("Front end Client disconnected.")
                #     break
                frame = cap.read()
                # check for frame if Nonetype
                if frame is None:
                    break

                if mapping_bev:
                    frame, results = detector.get_prediction_and_bev_image(frame=frame, bev_image=bev_image,
                                                                           homography_matrix=homography_matrix)
                else:
                    frame, results = detector.get_prediction_sahi(frame=frame)

                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                print("Prepare to send data to frontend .....")
                await self.send_event(
                    channel_layer=channel_layer,
                    results=results,
                    camera_id=cam_id,
                    camera_uri=video_url,
                    view_point_id=view_point.id,
                    timestamp=int(time.time()),
                    unique_id=unique_id
                )

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
                # print("Unique id ", unique_id)
                await asyncio.sleep(delay)
                print("Connection status ", connection_status)
                if not connection_status.get(unique_id):
                    break
        except:
            cap.stop()

    async def send_event(self, channel_layer, results: list[ObjectDetectionResult], **kwargs):
        await channel_layer.group_send(
            'vehicle_count_group',
            {
                'type': 'send_event',
                'data': {
                    'unique_id': kwargs.get('unique_id'),
                    'camera_id': kwargs.get('camera_id'),
                    'camera_uri': kwargs.get('camera_uri'),
                    'view_point_id': kwargs.get('view_point_id'),
                    'timestamp': kwargs.get('timestamp'),
                    'object_count_map': detector.count_objects(results)
                }
            }
        )
