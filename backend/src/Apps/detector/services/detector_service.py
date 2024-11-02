import tempfile
import os
from typing import List

import cv2
import numpy as np
from vidgear.gears import CamGear
import time

from src.Apps.detector.dataclass.object_detection_result import ObjectDetectionResult
from src.Apps.gis_map.dataclass.bev_metadata import BevImageMetaData
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
                                bev_meta: BevImageMetaData,
                                homography_matrix: List[List[float]],
                                results: list[ObjectDetectionResult]) -> List[tuple[float, float]]:
        homography_matrix = np.array(homography_matrix, dtype=np.float32)
        ltwh_list = [box.to_xywh() for box in results]
        image_width = bev_meta.width
        image_height = bev_meta.height
        center_long, center_lat = bev_meta.center_long_lat
        list_point_coordinates = []
        for box in ltwh_list:
            x, y, w, h = box
            if w * h < 10:  # Skip small boxes
                continue
            x_center = float(x + w / 2)
            y_center = float(y + h / 2)
            wrl = np.array(homography_matrix).dot(np.array([[x_center], [y_center], [1]]))
            wrl = wrl / wrl[2]  # Normalize ratio
            x_bev, y_bev = wrl[0], wrl[1]
            # Calculate the real-world coordinates
            x_ratio = x_bev / image_width
            y_ratio = y_bev / image_height
            x_diff = x_ratio - 0.5
            y_diff = y_ratio - 0.5
            x_diff = x_diff * 2 * 0.5
            y_diff = y_diff * 2 * 0.5
            x_long = center_long + x_diff
            y_lat = center_lat + y_diff


            list_point_coordinates.append((x_bev, y_bev))
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
            x_center = float(x + w / 2)
            y_center = float(y + h / 2)
            wrl = np.array(homography_matrix).dot(np.array([[x_center], [y_center], [1]]))
            wrl = wrl / wrl[2]  # Normalize ratio
            x_bev, y_bev = wrl[0], wrl[1]
            cv2.circle(cloned_bev_img, (int(x_bev), int(y_bev)), 5, (0, 255, 0), -1)
        return cloned_bev_img
