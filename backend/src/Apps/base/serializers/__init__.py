

__author__ = "minhhoangho99@gmail.com"
__date__ = "Oct 06, 2023 14:03"

from rest_framework import serializers, status

from src.Apps.base.exceptions import AppException


class ServiceSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        raise AppException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, instance, validated_data):
        raise AppException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self):
        raise AppException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
