from dataclasses import dataclass
from typing import List, Tuple
import numpy as np
import os
import cv2
from ultralytics import YOLO
from ultralytics.engine.results import Results
from sahi import AutoDetectionModel
from sahi.prediction import PredictionResult, ObjectPrediction
from sahi.utils.cv import read_image
from sahi.predict import get_prediction, get_sliced_prediction, predict


@dataclass
class ObjectDetectionResult:
    class_name: str
    conf: float
    xyxy: Tuple[int, int, int, int]


class DetectionUtil:
    def __init__(self, ckpt: str) -> None:
        ckpt_path = ckpt or os.path.join("./models", "yolov8.pt")
        # self.model = YOLO(ckpt_path)
        self.model = YOLO(ckpt_path)
        self.threshold = 0.3
        self.detection_model = AutoDetectionModel.from_pretrained(
            model_type='yolov8',
            model_path=ckpt_path,
            confidence_threshold=0.3,
            device="cpu",
        )

        self.class_dict = self.model.names

    def predict_obj(self, frame: np.ndarray, verbose=False) -> Tuple[np.ndarray, List[ObjectDetectionResult]]:
        results: List[Results] = self.model.predict(source=frame, verbose=verbose)
        list_item = []

        for _box in results[0].boxes:
            res = self._handle_box(_box)
            self._draw_bounding_box(frame, res)
            list_item.append(res)

        return frame, list_item

    def get_prediction_sahi(self, frame: np.ndarray) -> Tuple[np.ndarray, List[ObjectDetectionResult]]:
        result: PredictionResult = get_prediction(frame, self.detection_model)
        object_prediction_list = result.object_prediction_list
        list_item = []
        for _box in object_prediction_list:
            res: ObjectDetectionResult = self._handle_box_sahi(_box)
            list_item.append(res)
            self._draw_bounding_box(frame, res)
        return frame, list_item

    def count_objects(self, list_item):
        counter = dict()
        for item in list_item:
            if item["conf"] > self.threshold:
                class_name = item['class']
                if class_name in counter:
                    counter[class_name] += 1
                else:
                    counter[class_name] = 1
        return counter

    def _draw_bounding_box(self, image, box: ObjectDetectionResult):
        xyxy = box.xyxy
        class_name: str = box.class_name
        conf: float = box.conf

        x1, y1, x2, y2 = xyxy

        if conf >= self.threshold:
            # Draw the bounding box rectangle on the image
            cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)

            # Write the class name and confidence on the image
            text = f'{class_name} {conf:.2f}'
            cv2.putText(image, text, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    def _handle_box(self, box) -> ObjectDetectionResult:
        cords = box.xyxy[0].tolist()
        class_id = box.cls[0].item()
        conf = box.conf[0].item()

        return ObjectDetectionResult(
            class_name=self.class_dict[class_id],
            conf=conf,
            xyxy=cords,
        )

    def _handle_box_sahi(self, box: ObjectPrediction) -> ObjectDetectionResult:
        cords = box.bbox.to_xyxy()
        class_name = box.category.name
        conf = box.score.value

        return ObjectDetectionResult(
            class_name=class_name,
            conf=conf,
            xyxy=cords,
        )
