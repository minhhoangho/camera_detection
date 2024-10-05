import threading

from botocore.client import BaseClient
from django.conf import settings
import boto3
from botocore.client import Config


class AWSClientManager:
    config = None

    def __init__(self, service_name: str, region_name: str):
        self.service_name = service_name
        self.region_name = region_name
        self.aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        self.aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY
        self.aws_session_token = None
        if not self.config:
            self.config = Config(retries=dict(max_attempts=3))

    @property
    def session(self):
        return self._create_session()

    @property
    def client(self):
        return self.session.client(self.service_name)

    @property
    def resource(self):
        return self.session.resource(
            service_name=self.service_name,
            region_name=self.region_name,
            config=self.config,
        )

    def _create_session(self):
        return boto3.Session(
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            aws_session_token=self.aws_session_token,
            region_name=self.region_name
        )
