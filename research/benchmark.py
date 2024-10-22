import time
import cv2

from src.Apps.detector.detection_util import DetectionUtil




BENCHMARK_MODELS = [

]

IMG_PATH = 'input.jpg'

if __name__ == "__main__":
    print("Loading detector with different model")
    if not BENCHMARK_MODELS:
        print("Please provide model path in BENCHMARK_MODELS")
        exit(1)
    detectors = [
        DetectionUtil(ckpt_path) for ckpt_path in BENCHMARK_MODELS
    ]

    input_img = cv2.imread(IMG_PATH)

    for detector in detectors:
        start_time = time.perf_counter()
        detector.get_prediction_sahi(input_img)
        print(f"Time to get prediction: {time.perf_counter() - start_time}")


