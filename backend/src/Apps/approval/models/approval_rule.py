from django.db import models

from src.Apps.base.models.base import UUIDSoftDeleteModel
from src.Apps.base.models.cache import RCacheModel
from src.Apps.base.models.custom_data_types import TinyIntegerField
from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class ApprovalRule(AutoTimeStampedModel, UserInteractionModel, UUIDSoftDeleteModel, RCacheModel):
    approval_rule_group_id = models.PositiveIntegerField(default=0, db_index=True)
    targeting_rule = TinyIntegerField(default=0)
    match = TinyIntegerField(null=True)

    class Meta:
        db_table = "ai_approval_rules"
