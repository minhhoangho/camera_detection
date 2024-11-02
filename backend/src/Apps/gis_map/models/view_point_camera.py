from django.db import models

from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class GisViewPointCamera(UserInteractionModel, AutoTimeStampedModel):
    camera_source = models.IntegerField()
    camera_uri = models.CharField(max_length=1024)
    description = models.TextField(null=True, default='')
    view_point_id = models.PositiveIntegerField(db_index=True)
    captured_image = models.CharField(null=True, default='', max_length=1024)
    bev_image = models.CharField(null=True, default='', max_length=1024)
    homography_matrix = models.TextField(null=True, default='')
    bev_image_metadata = models.TextField(null=True, default='')

    class Meta:
        db_table = "gis_view_point_cameras"
