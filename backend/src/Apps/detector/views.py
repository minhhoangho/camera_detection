import json
from typing import AsyncGenerator

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import asyncio
from django.http import StreamingHttpResponse
from django.views.decorators import gzip
from requests import Request, Response
from rest_framework import viewsets
from rest_framework.decorators import action
from vidgear.gears import CamGear
import os
from django.conf import settings
import cv2
import requests
import numpy as np

from src.Apps.base.utils.type_utils import TypeUtils
from src.Apps.detector.detection_util import DetectionUtil
import time

from src.Apps.gis_map.models import GisViewPointCamera
from src.Apps.gis_map.services.gis_map import GisMapService

detector = DetectionUtil(os.path.join(settings.BASE_DIR, "../models", "yolov8m.pt"))
from src.Apps.base.constants.http import HttpMethod


class DetectorViewSet(viewsets.ViewSet):
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
        ae = request.META.get("HTTP_ACCEPT_ENCODING", "")
        cam_id = TypeUtils.safe_str(request.query_params.get("cam_id"))
        return StreamingHttpResponse(self.process_video(cam_id),
                                     content_type="multipart/x-mixed-replace; boundary=frame")

    # def stream_video(self, cam_id: int):
    #     async_gen = self.process_video(cam_id)
    #     for frame in async_to_sync(self.iterate_async_gen)(async_gen):
    #         yield frame
    #
    # async def iterate_async_gen(self, async_gen):
    #     for item in async_gen:
    #         yield item

    async def process_video(self, cam_id: int) -> AsyncGenerator[bytes, None]:
        camera_viewpoint = await GisViewPointCamera.objects.filter(id=cam_id).afirst()
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
        while True:
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
            await self.send_event(channel_layer, results)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            await asyncio.sleep(delay)

    async def send_event(self, channel_layer, results):
        await channel_layer.group_send(
            'vehicle_count_group',
            {
                'type': 'send_event',
                'event': {'count': detector.count_objects(results)}
            }
        )
