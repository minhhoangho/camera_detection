from rest_framework import serializers

from src.Apps.gis_map.models import GisViewPoint


class ViewPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = GisViewPoint
        fields = "__all__"


class CUViewPointSerializer(serializers.Serializer):
    lat = serializers.FloatField(required=True)
    long = serializers.FloatField(required=True)


class CUCameraViewPointSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    camera_source = serializers.IntegerField(required=True)
    camera_uri = serializers.CharField(required=True)
