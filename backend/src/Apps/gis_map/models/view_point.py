from django.db import models

from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class GisViewPoint(UserInteractionModel, AutoTimeStampedModel):
    name = models.CharField(max_length=1024, null=True)
    description = models.TextField(default="")
    lat = models.FloatField()
    long = models.FloatField()
    thumbnail = models.CharField(max_length=1024, null=True, default="")
    warning_threshold = models.IntegerField(default=0)

    class Meta:
        db_table = "gis_view_points"
