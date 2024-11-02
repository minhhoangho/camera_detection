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
        return x1, y1, x2 - x1, y2 - y1
