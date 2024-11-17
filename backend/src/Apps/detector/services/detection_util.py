from dataclasses import dataclass
from typing import List, Tuple
import numpy as np
import os
import cv2
from ultralytics import YOLO
from ultralytics.engine.results import Results
from sahi import AutoDetectionModel
from sahi.prediction import PredictionResult, ObjectPrediction
from sahi.predict import get_prediction
import time

from src.Apps.detector.constants.coco_class import VEHICLE_CLASS_IDS
from src.Apps.detector.dataclass.object_detection_result import ObjectDetectionResult
from src.Apps.detector.services.detector_service import DetectorService


class Yolov8Detector:
    def __init__(self, ckpt: str, model_type: str = "yolov8") -> None:
        self.ckpt_path = ckpt or os.path.join("./models", "yolov8.pt")
        self.model = YOLO(self.ckpt_path)
        self.threshold = 0.3
        self.detection_model = AutoDetectionModel.from_pretrained(
            model_type=model_type,
            model_path=self.ckpt_path,
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
        result: PredictionResult = get_prediction(frame, self.detection_model, [3,3])
        object_prediction_list = result.object_prediction_list
        list_item = []
        for _box in object_prediction_list:
            res: ObjectDetectionResult = self._handle_box_sahi(_box)
            if res.id not in VEHICLE_CLASS_IDS:
                continue
            list_item.append(res)
            self._draw_bounding_box(frame, res)
        return frame, list_item

    def get_prediction_and_bev_image(self, frame: np.ndarray, bev_image: np.ndarray,
                                     homography_matrix: List[List[float]]) -> Tuple[
        np.ndarray, List[ObjectDetectionResult]]:
        start_time = time.time()
        # result: PredictionResult = get_sliced_prediction(
        #     image=frame,
        #     detection_model=self.detection_model,
        #     slice_width=100,
        #     slice_height=100,
        # )
        result: PredictionResult = get_prediction(
            image=frame,
            detection_model=self.detection_model,
        )
        print(f"Time to get prediction: {time.time() - start_time}")
        object_prediction_list: List[ObjectPrediction] = result.object_prediction_list
        list_result: List[ObjectDetectionResult] = []
        for _box in object_prediction_list:
            res: ObjectDetectionResult = self._handle_box_sahi(_box)
            if res.id not in VEHICLE_CLASS_IDS:
                continue
            list_result.append(res)
            self._draw_bounding_box(frame, res)

        bev_image = DetectorService.map_to_bev_image(
            bev_image,
            homography_matrix,
            list_result
        )

        # Concat frame and bev_image vertically, note that we need to update width of bev_image to match frame
        bev_image = cv2.resize(bev_image, (frame.shape[1], frame.shape[0]))
        # And padding between frame and bev_image, the padding is white color
        padding = np.ones((30, frame.shape[1], 3), dtype=np.uint8) * 255
        out_frame = np.concatenate((frame, padding, bev_image), axis=0)
        return out_frame, list_result

    def count_objects(self, list_item: List[ObjectDetectionResult]) -> dict:
        counter = dict()
        for item in list_item:
            if item.conf > self.threshold:
                class_name = item.class_name
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
            id=class_id + 1,
            class_name=self.class_dict[class_id],
            conf=conf,
            xyxy=cords,
        )

    def _handle_box_sahi(self, box: ObjectPrediction) -> ObjectDetectionResult:
        _id = box.category.id
        cords = box.bbox.to_xyxy()
        class_name = box.category.name
        conf = box.score.value

        return ObjectDetectionResult(
            id=_id,
            class_name=class_name,
            conf=conf,
            xyxy=cords,
        )
