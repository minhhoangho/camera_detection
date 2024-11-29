from dataclasses import dataclass
from typing import Tuple


@dataclass
class ObjectDetectionResult:
    id: int
    class_name: str
    conf: float
    xyxy: Tuple[int, int, int, int]

    def to_xywh(self):
        x1, y1, x2, y2 = self.xyxy
        x_center = (x1 + x2) / 2
        y_center = (y1 + y2) / 2
        w = x2 - x1
        h = y2 - y1
        return x_center, y_center, w, h
