from ultralytics import YOLO
from pathlib import Path
import os
import time
import cv2

BASE_DIR = Path(__file__).parent.parent
IMG_PATH = '../img/cam_cong_nguyen_hue.jpg'
IMG_PATH = '../img/cau_rong.jpg'


if __name__ == '__main__':
    detectors = [
        YOLO(os.path.join(BASE_DIR, "models", "yolo11n.pt")),
        YOLO(os.path.join(BASE_DIR, "models", "yolo11s.pt")),
        YOLO(os.path.join(BASE_DIR, "models", "yolo11s.pt")),
    ]
    input_img = cv2.imread(IMG_PATH)
    for detector in detectors:
        print("-------------------------------------")
        print("Using model: ", detector.ckpt_path)
        start_time = time.perf_counter()
        detector.predict(input_img)
        print(f"Time to get prediction: {time.perf_counter() - start_time}")