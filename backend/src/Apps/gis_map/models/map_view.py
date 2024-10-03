from django.db import models

from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class GisMapView(UserInteractionModel, AutoTimeStampedModel):
    view_point_id = models.PositiveIntegerField(db_index=True)
    zoom = models.FloatField(default=15)
    lat = models.FloatField()
    long = models.FloatField()

    class Meta:
        db_table = "gis_map_views"
