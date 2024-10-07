from django.http import StreamingHttpResponse
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

from src.Apps.gis_map.services.gis_map import GisMapService

detector = DetectionUtil(os.path.join(settings.BASE_DIR, "../models", "yolov8m.pt"))
from src.Apps.base.constants.http import HttpMethod


class DetectorViewSet(viewsets.ViewSet):
    @action(methods=[HttpMethod.GET], url_path="video/realtime/raw", detail=False)
    def view_raw_realtime(self, request: Request, *args, **kwargs):
        video_url = TypeUtils.safe_str(request.query_params.get("uri"))
        return StreamingHttpResponse(self.handle_frames(video_url, view_raw=True),
                                     content_type="multipart/x-mixed-replace; boundary=frame")

    @action(methods=[HttpMethod.GET], url_path="video/realtime", detail=False)
    def detect_video_realtime(self, request: Request, *args, **kwargs):
        cam_id = TypeUtils.safe_str(request.query_params.get("cam_id"))
        return StreamingHttpResponse(self.process_video(cam_id),
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
            # with app.app_context():
            #     sse.publish({"objects": detector.count_objects(results)}, type='video_tracking')
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(delay)

    def process_video(self, cam_id: int):
        camera_viewpoint = GisMapService.get_view_point_camera_detail(cam_id)
        video_url = camera_viewpoint.camera_uri
        homography_matrix = camera_viewpoint.homography_matrix
        mapping_bev = True
        if homography_matrix:
            homography_matrix = np.array(homography_matrix)
        response = requests.get(camera_viewpoint.bev_image)

        img_array = np.array(bytearray(response.content), dtype=np.uint8)
        bev_image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        cap = CamGear(source=video_url, stream_mode=True, logging=True).start()  # YouTube Video URL as input
        # Define the desired frame rate (frames per second)
        frame_rate = 90
        # Calculate the delay between frames
        delay = 1 / frame_rate
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if mapping_bev:
                frame, results = detector.get_prediction_and_bev_image(frame=frame, bev_image=bev_image,
                                                                       homography_matrix=homography_matrix)
            else:
                frame, results = detector.get_prediction_sahi(frame=frame)
            yield frame
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(delay)
