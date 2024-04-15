from django.db import models

from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class GisMapLayer(UserInteractionModel, AutoTimeStampedModel):
    name = models.CharField(max_length=1024)
    description = models.TextField()
    url = models.CharField(max_length=1024)

    class Meta:
        db_table = "gis_map_layers"
