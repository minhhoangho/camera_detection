import tempfile
import os
from typing import List

import cv2
import numpy as np
from vidgear.gears import CamGear
import time

from src.Apps.detector.dataclass.object_detection_result import ObjectDetectionResult
from src.Apps.gis_map.dataclass.bev_metadata import BevImageMetaData, Coordinate
from src.Apps.utils.aws_client.s3_storage import S3Storage


class DetectorService:

    @classmethod
    def calculate_traffic_metrics(cls, image, timestamp):
        pass

    @classmethod
    def handle_capture_video_and_upload_s3(cls, video_url: str, file_name: str) -> str:
        video_stream = CamGear(source=video_url, stream_mode=True, logging=True).start()
        # Convert file name to lowercase and snakecase first, then add timestamp in format and file extension
        file_name = file_name.lower().replace(" ", "_")
        file_name = f"{file_name}_{int(time.time())}.jpg"
        s3_file_url = ""
        while True:
            frame = video_stream.read()
            if frame is None:
                break

            # Upload the frame to S3
            s3_file_url = cls.handle_upload_image(frame, file_name)
            break

        return s3_file_url

    @classmethod
    def handle_upload_image(cls, file: np.ndarray, file_name: str) -> str:
        print("File name:", file_name)
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            # Open the original image file and copy its content to the temp file
            cv2.imwrite(temp_file.name, file)
            temp_file_path = temp_file.name  # Get the temp file path

        try:
            # Upload the temp file to S3
            s3_storage = S3Storage()

            return s3_storage.upload_file(temp_file_path, file_name,
                                          ExtraArgs={"ContentType": "image/jpeg", "ACL": "public-read"})
        finally:
            # Remove the temp file
            try:
                os.remove(temp_file_path)
                print(f"Temporary file '{temp_file_path}' deleted.")
            except Exception as e:
                print(f"Error deleting the temporary file: {e}")

        return ""

    @classmethod
    def generate_point_vehicles(cls,
                                bev_meta: dict,
                                homography_matrix: List[List[float]],
                                results: list[ObjectDetectionResult]) -> List[dict]:
        homography_matrix = np.array(homography_matrix, dtype=np.float32)
        ltwh_list = [box.to_xywh() for box in results]
        # print("List point ltwh_list:", ltwh_list)
        # print("List point ltwh_list:", bev_meta)
        image_width = bev_meta.get("width")
        image_height = bev_meta.get("height")
        image_coordinates = bev_meta.get("image_coordinates", {})
        top_left: Coordinate = Coordinate(**image_coordinates.get("top_left", {}))
        top_right: Coordinate = Coordinate(**image_coordinates.get("top_right", {}))
        bottom_left: Coordinate = Coordinate(**image_coordinates.get("bottom_left", {}))
        bottom_right: Coordinate = Coordinate(**image_coordinates.get("bottom_right", {}))
        list_point_coordinates = []
        for box in ltwh_list:
            x, y, w, h = box
            if w * h < 10:  # Skip small boxes
                continue
            # x_center = float(x + w / 2)
            # y_center = float(y + h / 2)
            x_center = float(x)
            y_center = float(y)
            wrl = np.array(homography_matrix, dtype=np.float32).dot(
                np.array([[x_center], [y_center], [1]], dtype=np.float32))
            wrl = wrl / wrl[2]  # Normalize ratio
            x_bev, y_bev = wrl[0], wrl[1]

            # Calculate the real-world coordinates
            x_ratio = x_bev / image_width
            y_ratio = y_bev / image_height
            top_lat = top_left.lat + (top_right.lat - top_left.lat) * x_ratio
            top_long = top_left.long + (top_right.long - top_left.long) * x_ratio
            bottom_lat = bottom_left.lat + (bottom_right.lat - bottom_left.lat) * x_ratio
            bottom_long = bottom_left.long + (bottom_right.long - bottom_left.long) * x_ratio
            lat = top_lat + (bottom_lat - top_lat) * y_ratio
            long = top_long + (bottom_long - top_long) * y_ratio

            list_point_coordinates.append({
                "lat": float(lat),
                "long": float(long)
            })
        return list_point_coordinates

    @classmethod
    def map_to_bev_image(cls, bev_img: np.ndarray, homography_matrix: List[List[float]],
                         results: List[ObjectDetectionResult]) -> np.ndarray:
        cloned_bev_img = bev_img.copy()
        homography_matrix = np.array(homography_matrix, dtype=np.float32)
        ltwh_list = [box.to_xywh() for box in results]
        for box in ltwh_list:
            x, y, w, h = box
            if w * h < 10:  # Skip small boxes
                continue
            # x_center = float(x + w / 2)
            # y_center = float(y + h / 2)
            x_center = float(x)
            y_center = float(y)
            wrl = np.array(homography_matrix).dot(np.array([[x_center], [y_center], [1]]))
            wrl = wrl / wrl[2]  # Normalize ratio
            x_bev, y_bev = wrl[0], wrl[1]
            cv2.circle(cloned_bev_img, (int(x_bev), int(y_bev)), 5, (0, 255, 0), -1)
        return cloned_bev_img
