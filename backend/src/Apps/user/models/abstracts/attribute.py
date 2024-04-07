from django.db import models
from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class Attribute(AutoTimeStampedModel, UserInteractionModel):
    value = models.CharField(max_length=960, default="", null=True, blank=True)
    attribute_key_id = models.PositiveIntegerField(db_index=True)

    class Meta:
        abstract = True
