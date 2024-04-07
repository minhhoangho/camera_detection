from django.db import models

from src.Apps.base.models.base import UUIDSoftDeleteModel
from src.Apps.base.models.cache import RCacheModel
from src.Apps.base.models.custom_data_types import TinyIntegerField
from src.Apps.base.models.timestamped import AutoTimeStampedModel
from src.Apps.base.models.user_interaction import UserInteractionModel


class ApprovalFlow(AutoTimeStampedModel, UserInteractionModel, UUIDSoftDeleteModel, RCacheModel):
    company_id = models.PositiveIntegerField(default=0, db_index=True)
    # Name, must be unique
    name = models.CharField(default="", max_length=255, db_index=True)
    # Applicant flow status (0: Draft; 1: Inactivate; 2: Activate)
    status = TinyIntegerField(default=0)
    # Save base reference record for publish logic
    base_id = models.PositiveIntegerField(db_index=True, default=0)

    class Meta:
        db_table = "ai_approval_flows"
