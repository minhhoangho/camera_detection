import time
from pathlib import Path

import cv2
import os

BASE_DIR = Path(__file__).parent.parent

from src.Apps.detector.services.detection_util import Yolov8Detector

BENCHMARK_MODELS = [
    {
        "path": os.path.join(BASE_DIR, "models", "yolov8n.pt"),
        "model_type": 'yolov8'
    },
    {
        "path": os.path.join(BASE_DIR, "models", "yolov8s.pt"),
        "model_type": 'yolov8'
    },
    {
        "path": os.path.join(BASE_DIR, "models", "yolov8m.pt"),
        "model_type": 'yolov8'
    },

]

IMG_PATH = '../img/cam_cong_nguyen_hue.jpg'
# IMG_PATH = '../img/cau_rong.jpg'

if __name__ == "__main__":
    print("Loading detector with different model")
    if not BENCHMARK_MODELS:
        print("Please provide model path in BENCHMARK_MODELS")
        exit(1)
    detectors = [
        Yolov8Detector(ckpt=ckpt_model['path'], model_type=ckpt_model['model_type']) for ckpt_model in BENCHMARK_MODELS
    ]

    input_img = cv2.imread(IMG_PATH)

    for detector in detectors:
        print("-------------------------------------")
        print("Using model: ", detector.ckpt_path)
        start_time = time.perf_counter()
        detector.get_prediction_sahi(input_img)
        print(f"Time to get prediction: {time.perf_counter() - start_time}")

