from http import HTTPStatus
from django.conf import settings
import os
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.request import Request
import cv2
import time
import numpy as np
from rest_framework.response import Response
from ultralytics import YOLO
from ultralytics.engine.results import Results, Boxes

from src.Apps.detector.constants.coco_class import COCO_CLASSES

MODEL_DETECTOR = {
    "yolov8n": YOLO(os.path.join(settings.BASE_DIR, "../models", "yolov8n.pt")),
    "yolov8s": YOLO(os.path.join(settings.BASE_DIR, "../models", "yolov8s.pt")),
    "yolov8m": YOLO(os.path.join(settings.BASE_DIR, "../models", "yolov8m.pt")),
    "yolo11n": YOLO(os.path.join(settings.BASE_DIR, "../models", "yolo11n.pt")),
    "yolo11s": YOLO(os.path.join(settings.BASE_DIR, "../models", "yolo11s.pt")),
    "yolo11m": YOLO(os.path.join(settings.BASE_DIR, "../models", "yolo11m.pt")),
}

class BenchmarkViewSet(viewsets.ViewSet):
    def create(self, request: Request):
        query_params = request.query_params.copy()
        input_image = request.FILES.get("image")
        model_type = query_params.get("model_type")
        output = None

        # Read the image file from the request
        image_data = input_image.read()
        # Convert the image file to a NumPy array
        np_arr = np.frombuffer(image_data, np.uint8)
        # Decode the NumPy array to an image using OpenCV
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        model_detector: YOLO = MODEL_DETECTOR.get(model_type)
        start_time = time.perf_counter()
        if model_detector:
            res: list[Results] = model_detector.predict(img, conf=0.6)
            total_time = time.perf_counter() - start_time
            if res:
                output = self._poss_process_result(res[0])
        else:
            total_time = None

        return Response(status=HTTPStatus.OK, data={
            "output": output,
            "model_type": model_type,
            "time": total_time
        })

    def _poss_process_result(self, res: Results) -> dict:
        plotted_image = res.plot()
        ret, buffer = cv2.imencode('.jpg', plotted_image)
        image_bytes = buffer.tobytes()
        format_res = {
            # "image": image_bytes,
            "total": 0,
            "objects": []
        }
        if not res:
            return format_res
        boxes: Boxes = res.boxes
        format_res["total"] = len(boxes)

        for box in boxes:
            class_id = int(box.cls[0].item())
            cord = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            print(f"Class: {class_id}, Confidence: {conf}, Cord: {cord}")
            format_res["objects"].append({
                "label": COCO_CLASSES[class_id + 1],
                "confidence": conf,
                "box":list(cord)
            })

        return format_res


    def retrieve(self):
        pass

    def list(self):
        pass

    def update(self):
        pass

    def delete(self):
        pass
