import tempfile
import os
import cv2
import numpy as np
from vidgear.gears import CamGear
import time

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

            return s3_storage.upload_file(temp_file_path, file_name, ExtraArgs={"ContentType": "image/jpeg", "ACL": "public-read"})
        finally:
            # Remove the temp file
            try:
                os.remove(temp_file_path)
                print(f"Temporary file '{temp_file_path}' deleted.")
            except Exception as e:
                print(f"Error deleting the temporary file: {e}")

        return ""
