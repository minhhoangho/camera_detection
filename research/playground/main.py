from typing import List, Tuple

import cv2
from pytube import YouTube
import time
from ultralytics import YOLO
import os
from ultralytics.engine.results import Results

from src.Apps.detector.services.detection_util import Yolov8Detector

VEHICLE_CLASSES = [
    {"id": 2, "name": "bicycle"},
    {"id": 3, "name": "car"},
    {"id": 4, "name": "motorcycle"},
    {"id": 5, "name": "airplane"},
    {"id": 6, "name": "bus"},
    {"id": 7, "name": "train"},
    {"id": 8, "name": "truck"},
    {"id": 9, "name": "boat"},
]

VEHICLE_CLASS_IDS = [v.get("id") for v in VEHICLE_CLASSES]


def init_model() -> YOLO:
    # model = YOLO(os.path.join("../../models", "yolov8s.pt"))
    # model = YOLO(os.path.join("../../models", "yolov8s.pt"))
    model = YOLO("yolo11s.pt")
    return model

def predict_obj(model: YOLO,frame):
    results: List[Results] = model.predict(source=frame, verbose=False)
    class_dict = results[0].names

    for _box in results[0].boxes:
        # Only detect vehicles
        # print class id and class name
        cls_id = _box.cls[0].item()
        cls_name = class_dict[cls_id]
        if int(cls_id) +1 not in VEHICLE_CLASS_IDS:
            continue
        print("Class ID: ", cls_id, "Class Name: ", cls_name)
        res = handle_box(_box, class_dict)
        draw_bounding_box(frame, res)

    return frame, results

def draw_bounding_box(image, box, threshold=0.4):
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

def handle_box(box, class_dict: dict) -> dict:
  cords = box.xyxy[0].tolist()
  class_id = box.cls[0].item()
  conf = box.conf[0].item()

  return {
      "xyxy": cords,
      "class": class_dict[class_id],
      "conf": conf,
  }



def tracking_video(video_id):
    model = init_model()
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    yt = YouTube(video_url)
    stream = yt.streams.get_highest_resolution()
    cap = cv2.VideoCapture(stream.url)

    # Define the desired frame rate (frames per second)
    frame_rate = 90

    # Calculate the delay between frames
    delay = 1 / frame_rate
    while True:
        ret, frame = cap.read()

        if not ret:
            break

        frame, results = predict_obj(model=model, frame=frame)
        cv2.imshow("Livestream", frame)
        # Exit the loop when the 'q' key is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        # Introduce a delay between frames
        time.sleep(delay)

    # Release the video capture and close all windows
    cap.release()
    cv2.destroyAllWindows()


def detect_single_image(img_path):
    model = init_model()
    img = cv2.imread(img_path)
    frame, results = predict_obj(model=model, frame=img)
    cv2.imshow("Image", frame)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == '__main__':
    # VIDEO_ID = "_HcPxEE8OFE"
    # tracking_video(video_id=VIDEO_ID)
    img_path = "/Users/hominhhoang/Documents/Work/01_Software-development/01_Github_minhhoangho/camera_detection/research/images/frame_26.jpg"
    detect_single_image(img_path=img_path)

    # detector = Yolov8Detector("/Users/hominhhoang/Documents/Work/01_Software-development/01_Github_minhhoangho/camera_detection/models/yolov8m.pt")
    # img = cv2.imread(img_path)
    # frame, results = detector.get_prediction_sahi(img)
    # cv2.imshow("Image", frame)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()



