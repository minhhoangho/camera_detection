from typing import List, Tuple
import os
import cv2
from ultralytics import YOLO
from ultralytics.engine.results import Results

class DetectionUtil:
    def __init__(self, ckpt: str) -> None:
        ckpt_path = ckpt or os.path.join("./models", "yolov8m.pt")
        self.model = YOLO(ckpt_path)
        self.class_dict = self.model.names
    
    def predict_obj(self, frame, verbose=False):
        results: List[Results] = self.model.predict(source=frame, verbose=verbose)

        for _box in results[0].boxes:
            res = self._handle_box(_box)
            self._draw_bounding_box(frame, res)

        return frame, results[0]

    def count_objects(self, result: Results):
        counter = dict()
        for _box in result.boxes:
            class_id = _box.cls[0].item()
            class_name = self.class_dict[class_id]
            if class_name in counter:
                counter[class_name] +=1
            else:
                counter[class_name] = 1
        return counter


    def _draw_bounding_box(self, image, box, threshold=0.4):
        xyxy = box['xyxy']
        class_name: str = box['class']
        conf: float = box['conf']

        x1, y1, x2, y2 = xyxy

        if conf >= threshold:
            # Draw the bounding box rectangle on the image
            cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 0), 2)

            # Write the class name and confidence on the image
            text = f'{class_name} {conf:.2f}'
            cv2.putText(image, text, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    def _handle_box(self, box) -> dict:
        cords = box.xyxy[0].tolist()
        class_id = box.cls[0].item()
        conf = box.conf[0].item()

        return {
            "xyxy": cords,
            "class": self.class_dict[class_id],
            "conf": conf,
        }