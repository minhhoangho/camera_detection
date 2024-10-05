from django.http import StreamingHttpResponse
from requests import Request, Response
from rest_framework import viewsets
from rest_framework.decorators import action
from vidgear.gears import CamGear
import os
from django.conf import settings
import cv2

from src.Apps.base.utils.type_utils import TypeUtils
from src.Apps.detector.detection_util import DetectionUtil
import time

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
        video_url = TypeUtils.safe_str(request.query_params.get("uri"))
        return StreamingHttpResponse(self.handle_frames(video_url),
                                     content_type="multipart/x-mixed-replace; boundary=frame")

    def handle_frames(self, video_url: str, view_raw=False):
        cap = CamGear(source=video_url, stream_mode=True, logging=True).start()  # YouTube Video URL as input

        # Define the desired frame rate (frames per second)
        frame_rate = 90
        # Calculate the delay between frames
        delay = 1 / frame_rate
        while True:
            frame = cap.read()
            if not view_raw:
                frame, results = detector.get_prediction_sahi(frame=frame)
            # with app.app_context():
            #     sse.publish({"objects": detector.count_objects(results)}, type='video_tracking')
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(delay)
