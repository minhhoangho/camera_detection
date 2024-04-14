from django.db import models

from src.Apps.user.models.abstracts.attribute import Attribute


class UserAttribute(Attribute):
    user_id = models.PositiveIntegerField(db_index=True)

    class Meta:
        db_table = "user_attributes"
