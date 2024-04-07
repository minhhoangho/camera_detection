from enum import IntEnum


class SystemAttributeKeyType(IntEnum):
    USER = 1
    LOCATION = 2


class SystemAttributeKeyStatus:
    ACTIVE = 1
    INACTIVE = 2

    @classmethod
    def is_valid(cls, status):
        return status in [cls.ACTIVE, cls.INACTIVE]

    @classmethod
    def is_active(cls, status: int) -> bool:
        return status == cls.ACTIVE

    @classmethod
    def is_inactive(cls, status: int) -> bool:
        return status == cls.INACTIVE


class SystemAttributePrivacy:
    NONE = 1
    ENCRYPT = 2
    MASK = 3

    SECURED_OPTIONS = [ENCRYPT, MASK]

    @classmethod
    def is_valid(cls, privacy):
        return privacy in [cls.NONE, cls.ENCRYPT, cls.MASK]


class SystemAttributeKeyCategory:
    STANDARD = 1
    CUSTOM = 2

    @classmethod
    def is_valid(cls, category):
        return category in [cls.STANDARD, cls.CUSTOM]

    @classmethod
    def is_standard(cls, category):
        return cls.STANDARD == category

    @classmethod
    def is_custom(cls, category):
        return cls.CUSTOM == category


class SystemAttributeDataType:
    FREE_TEXT = 1
    LIST_SELECT = 2
