from django.db import models

from src.Apps.base.models.base import UUIDSoftDeleteModel
from src.Apps.base.models.cache import RCacheModel
from src.Apps.base.models.custom_data_types import TinyIntegerField
from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class ApprovalRuleGroup(AutoTimeStampedModel, UserInteractionModel, UUIDSoftDeleteModel, RCacheModel):
    approval_flow_id = models.PositiveIntegerField(default=0, db_index=True)
    # Name, must be unique
    item_connect_operator = TinyIntegerField(null=True)

    class Meta:
        db_table = "ai_approval_rule_groups"
