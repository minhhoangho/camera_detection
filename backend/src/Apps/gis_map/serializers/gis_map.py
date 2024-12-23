from rest_framework import serializers

from src.Apps.gis_map.models import GisViewPoint, GisViewPointCamera, GisMapView


class ViewPointSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = GisViewPoint
        exclude = ("thumbnail",)


class MapViewPointSerializer(serializers.ModelSerializer):
    zoom = serializers.FloatField(required=True)
    lat = serializers.FloatField(required=True)
    long = serializers.FloatField(required=True)
    class Meta:
        model = GisMapView
        fields = "__all__"

class CUViewPointSerializer(serializers.Serializer):
    lat = serializers.FloatField(required=True)
    long = serializers.FloatField(required=True)
    map_view = MapViewPointSerializer(required=True)
    warning_threshold = serializers.IntegerField(required=False, default=0)



class CameraViewPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = GisViewPointCamera
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get("homography_matrix"):
            data["homography_matrix"] = eval(data["homography_matrix"])
        return data

class CUCameraViewPointSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    camera_source = serializers.IntegerField(required=True)
    camera_uri = serializers.CharField(required=True)
