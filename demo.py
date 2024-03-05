import sys
sys.path.append("./")
import os
from detection_util import DetectionUtil
from sahi.utils.cv import read_image


detector = DetectionUtil(os.path.join("./models", "yolov8m.pt"))


detector.get_prediction_sahi(read_image("./img/image.jpg"))
