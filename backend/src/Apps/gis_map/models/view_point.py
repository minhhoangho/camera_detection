from django.db import models

from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class GisViewPoint(UserInteractionModel, AutoTimeStampedModel):

    lat = models.FloatField()
    long = models.FloatField()

    class Meta:
        db_table = "gis_view_points"
