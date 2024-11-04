from http import HTTPStatus

from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.request import Request
import cv2
import time
import numpy as np
from rest_framework.response import Response
from ultralytics import YOLO
from ultralytics.engine.results import Results

MODEL_DETECTOR = {}

class BenchmarkViewSet(viewsets.ViewSet):
    def list(self, request: Request):
        query_params = request.query_params.copy()
        input_image = request.FILES.get("image")
        model_type = query_params.get("model_type")
        # Read the image file from the request
        image_data = input_image.read()
        # Convert the image file to a NumPy array
        np_arr = np.frombuffer(image_data, np.uint8)
        # Decode the NumPy array to an image using OpenCV
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


        model_detector: YOLO = MODEL_DETECTOR.get(model_type)

        start_time = time.perf_counter()
        res: list[Results] = model_detector.predict(img)
        output = None
        if res:
            output = self._poss_process_result(res[0])
        total_time = time.perf_counter() - start_time

        return Response(status=HTTPStatus.OK, data={
            "output": output,
            "model_type": model_type,
            "time": total_time
        })

    def _poss_process_result(self, res: Results) -> dict:
        format_res = {
            "total": 0,
            "objects": []
        }
        if not res:
            return format_res
        format_res["total"] = len(res.boxes)
        for box in res.boxes:
            format_res["objects"].append({
                "label": box.get("label"),
                "confidence": box.get("confidence"),
                "box": box.get("box")
            })
        return format_res


    def retrieve(self):
        pass

    def create(self):
        pass

    def update(self):
        pass

    def delete(self):
        pass
