from django.db import models

from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class GisViewPoint(UserInteractionModel, AutoTimeStampedModel):
    name = models.CharField(max_length=1024)
    description = models.TextField()
    lat = models.FloatField()
    long = models.FloatField()

    class Meta:
        db_table = "gis_view_points"
