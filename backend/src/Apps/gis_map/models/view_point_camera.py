from django.db import models

from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class GisViewPointCamera(UserInteractionModel, AutoTimeStampedModel):
    camera_source = models.IntegerField()
    camera_uri = models.CharField(max_length=1024)
    description = models.TextField(null=True, default='')
    view_point_id = models.PositiveIntegerField(db_index=True)

    class Meta:
        db_table = "gis_view_point_cameras"
