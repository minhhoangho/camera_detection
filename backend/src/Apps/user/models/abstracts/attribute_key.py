from src.Apps.base.models.custom_data_types import TinyIntegerField, PositiveTinyIntegerField
from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel
from django.db import models

from src.Apps.user.constants.system_attribute_key import SystemAttributeKeyCategory, SystemAttributeKeyStatus, \
    SystemAttributePrivacy, SystemAttributeDataType


class AttributeKey(AutoTimeStampedModel, UserInteractionModel):
    label = models.CharField(null=False, blank=False, max_length=255)
    key_name = models.CharField(null=False, blank=False, max_length=50)
    description = models.CharField(null=False, blank=False, max_length=255)
    is_default = models.BooleanField(default=False)
    category = TinyIntegerField(default=SystemAttributeKeyCategory.CUSTOM)
    status = TinyIntegerField(default=SystemAttributeKeyStatus.ACTIVE)
    privacy_setting = TinyIntegerField(default=SystemAttributePrivacy.NONE)
    attribute_data_type = PositiveTinyIntegerField(default=SystemAttributeDataType.FREE_TEXT)

    class Meta:
        abstract = True
