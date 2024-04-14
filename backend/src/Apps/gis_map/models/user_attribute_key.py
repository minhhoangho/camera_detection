from src.Apps.base.models.custom_data_types import TinyIntegerField
from src.Apps.user.constants.system_attribute_key import SystemAttributeKeyType
from src.Apps.user.models.abstracts.attribute_key import AttributeKey


class UserAttributeKey(AttributeKey):
    attribute_type = TinyIntegerField(default=SystemAttributeKeyType.USER)

    class Meta:
        db_table = "user_attribute_keys"
