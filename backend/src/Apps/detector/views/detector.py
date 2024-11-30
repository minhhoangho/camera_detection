import json
import uuid
from typing import AsyncGenerator

import asyncio
from django.http import StreamingHttpResponse, HttpResponse
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

from src.Apps.detector.services.detector_service import DetectorService
from src.Apps.gis_map.dataclass.bev_metadata import BevImageMetaData, ImageCoordinate
from src.Apps.gis_map.models import GisViewPointCamera, GisViewPoint

# detector = Yolov8Detector(os.path.join(settings.BASE_DIR, "../models", "yolov8s.pt"))
detector = Yolov8Detector(os.path.join(settings.BASE_DIR, "../models", "yolov8_best.pt"))
from src.Apps.base.constants.http import HttpMethod
from src.Apps.websocket.shared_state import connection_status


import torch
import math
# this ensures that the current MacOS version is at least 12.3+
print("torch.backends.mps.is_available(): ", torch.backends.mps.is_available())
# this ensures that the current current PyTorch installation was built with MPS activated.
print("torch.backends.mps.is_built(): ", torch.backends.mps.is_built())

class DetectorViewSet(viewsets.ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @action(methods=[HttpMethod.GET], url_path="video/realtime/raw", detail=False)
    def view_raw_realtime(self, request: Request, *args, **kwargs):
        video_url = TypeUtils.safe_str(request.query_params.get("uri"))
        return StreamingHttpResponse(self.handle_raw_video_source(video_url),
                                     content_type="multipart/x-mixed-replace; boundary=frame")
        #
        # response['Connection'] = 'keep-alive'
        # response['Accept-Ranges'] = 'bytes'
        # return response

    async def handle_raw_video_source(self, video_url: str) -> AsyncGenerator[bytes, None]:
        cap = CamGear(source=video_url, stream_mode=True, logging=True).start()  # YouTube Video URL as input

        # Define the desired frame rate (frames per second)
        frame_rate = 60
        # Calculate the delay between frames
        delay = 1 / frame_rate
        try:
            while True:
                try_count = 0
                try:
                    frame = cap.read()
                except:
                    try_count += 1
                    if try_count > 20:
                        print("Error in reading frame")
                        break
                    continue
                if frame is None:
                    print("Error in reading frame")
                    break
                frame = np.array(frame)
                ret, buffer = cv2.imencode('.jpg', frame)
                if not ret:
                    print("Error in encoding frame to JPEG")
                    continue
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

                # time.sleep(delay)
                await asyncio.sleep(delay)

        except Exception as e:
            print("[handle_raw_video_source] Error in reading frame ", e)
        finally:
            print("Stop camera")
            cap.stop()

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
        from channels.layers import get_channel_layer

        request_id = str(uuid.uuid4())
        unique_id = f"{request_id}_{cam_id}"

        camera_viewpoint: GisViewPointCamera = await GisViewPointCamera.objects.filter(id=cam_id).afirst()
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

        error = False
        try:
            cap = CamGear(source=video_url, stream_mode=True, logging=True).start()
        except:
            error = True
            print("Error in opening camera")

        if error:
            return

            # YouTube Video URL as input
        # Define the desired frame rate (frames per second)
        frame_rate = 90
        # Calculate the delay between frames
        delay = 1 / frame_rate
        channel_layer = get_channel_layer()
        count = 0
        fps = 30
        # if count == fps, start detection
        results = []
        try_count = 0
        try:
            while True:

                # if not request.is_running():  # Check if the request is still valid
                #     print("Front end Client disconnected.")
                #     break
                try:
                    frame = cap.read()
                except:
                    try_count += 1
                    if try_count > 20:
                        print("Error in reading frame")
                        break
                    continue
                # check for frame if Nonetype
                if frame is None:
                    break
                vehicle_points = []
                # if count == fps, start detection
                if True:
                    if mapping_bev:
                        frame, results = detector.get_prediction_and_bev_image(frame=frame, bev_image=bev_image,
                                                                               homography_matrix=homography_matrix)
                        bev_meta = camera_viewpoint.bev_image_metadata
                        bev_meta = json.loads(bev_meta)
                        vehicle_points = DetectorService.generate_point_vehicles(bev_meta, homography_matrix, results)
                        await self.send_points(
                            channel_layer=channel_layer,
                            points=vehicle_points,
                            camera_id=cam_id,
                            camera_uri=video_url,
                            view_point_id=view_point.id,
                            timestamp=int(time.time()),
                            unique_id=unique_id
                        )
                    else:
                        frame, results = detector.get_prediction_sahi(frame=frame)
                else:
                    if mapping_bev:
                        bev_image = DetectorService.map_to_bev_image(
                            bev_image,
                            homography_matrix,
                            results
                        )
                        # Concat frame and bev_image vertically, note that we need to update width of bev_image to match frame
                        bev_image = cv2.resize(bev_image, (frame.shape[1], frame.shape[0]))
                        # And padding between frame and bev_image, the padding is white color
                        padding = np.ones((30, frame.shape[1], 3), dtype=np.uint8) * 255
                        frame = np.concatenate((frame, padding, bev_image), axis=0)
                count += 1

                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                # print("Prepare to send data to frontend .....")
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
                await asyncio.sleep(delay)
                print("Connection status ", connection_status, "Current session: ", unique_id)
                if not connection_status.get(unique_id):
                    print(f"Front end Client ({unique_id})  disconnected.")
                    break
        except Exception as e:
            print("[process_video] Error in reading frame ", e)
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

    async def send_points(self, channel_layer, points: list[dict], **kwargs):
        await channel_layer.group_send(
            'vehicle_count_group',
            {
                'type': 'send_points',
                'data': {
                    'unique_id': kwargs.get('unique_id'),
                    'camera_id': kwargs.get('camera_id'),
                    'camera_uri': kwargs.get('camera_uri'),
                    'view_point_id': kwargs.get('view_point_id'),
                    'timestamp': kwargs.get('timestamp'),
                    'vehicle_points': points
                }
            }
        )
