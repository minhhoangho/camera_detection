import datetime
import time

from src.Apps.base.logging.application_log import AppLog
from src.Apps.utils.aws_client.aws_manager import AWSClientManager
import os

from django.conf import settings


class S3Storage(AWSClientManager):
    SERVICE_NAME = "s3"

    def __init__(self, region_name: str = "ap-southeast-1"):
        super().__init__(self.SERVICE_NAME, region_name)
        self._bucket_name = settings.AWS_S3_PUBLIC_BUCKET or "app-public-bucket"
        self._bucket = None

    @property
    def bucket_name(self):
        return self._bucket_name

    @property
    def bucket(self):
        if self._bucket is None:
            self._bucket = self.resource.Bucket(self.bucket_name)
        return self._bucket

    def gen_s3_signed_uri(self, uri, expires_in=1800, method="GET", headers={}, bn=None, sync_folder=None):
        try:
            clientMethod = "get_object"
            params = dict(
                Bucket=self.bucket_name,
                Key=uri,
            )
            if method.lower() == "put":
                clientMethod = "put_object"
                if headers:
                    params.update(headers)
            signed_uri = self.client.generate_presigned_url(
                ClientMethod=clientMethod,
                Params=params,
                ExpiresIn=expires_in,
                HttpMethod=method,
            )
            return {"signed_uri": signed_uri, "expires_in": expires_in}
        except Exception as e:
            AppLog.error_exception(e)
            return {"signed_uri": "", "expires_in": ""}

    def gen_presigned_uri(self, file_name: str) -> dict:
        upload_path = os.path.join(settings.MEDIAFILES_LOCATION,
                                   datetime.date.today().strftime(settings.CANDIDATE_PATH))
        file_name = f"{int(time.time())}_{file_name}"
        expires_in = 60 * 60 * 7
        file_path = os.path.join(upload_path, file_name)
        s3_signed = self.gen_s3_signed_uri(file_path, method="PUT", expires_in=expires_in)
        return dict(
            signed_uri=s3_signed.get("signed_uri"),
            expires_in=s3_signed.get("expires_in"),
            upload_path=upload_path,
            file_name=file_name,
        )

    def upload_file(self, local_file_path: str, s3_file_path: str):
        try:
            self.bucket.upload_file(local_file_path, self.bucket_name, s3_file_path)
            return True
        except Exception as e:
            AppLog.error_exception(e)
            return False

    def size(self, name: str) -> int:
        return self.bucket.Object(name).content_length

    def content(self, name: str, read: bool = True) -> bytes:
        body = self.bucket.Object(name).get()["Body"]
        return body.read() if read else body
