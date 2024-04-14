
from django.utils.translation import gettext_lazy as _

from src.Apps.base.constants import const


class DeviceType:
    MOBILE = 1  #
    ANDROID_PHONE = 2
    IOS_PHONE = 3
    WINDOWPHONE = 4
    ANDROID_TABLET = 5
    IOS_TABLET = 6
    MOBILE_WEB = 7
    DESKTOP_WEB = 8
    PUBLIC_API = 9
    CHROME_EXTENSION = 10

    @staticmethod
    def is_login_code_supported(device_type):
        return device_type in [DeviceType.DESKTOP_WEB, DeviceType.MOBILE_WEB, DeviceType.CHROME_EXTENSION]

    @staticmethod
    def is_android(device_type):
        return device_type in [DeviceType.ANDROID_PHONE, DeviceType.ANDROID_TABLET]

    @staticmethod
    def is_ios(device_type):
        return device_type in [DeviceType.IOS_PHONE, DeviceType.IOS_TABLET]

    @classmethod
    def to_text(cls, val):
        if val == cls.MOBILE:
            return _("Mobile")
        if val == cls.ANDROID_PHONE:
            return _("Android Phone")
        if val == cls.IOS_PHONE:
            return _("iOS Phone")
        if val == cls.WINDOWPHONE:
            return _("Windows Phone")
        if val == cls.ANDROID_TABLET:
            return _("Android Tablet")
        if val == cls.IOS_TABLET:
            return _("iOS Tablet")
        if val == cls.MOBILE_WEB:
            return _("Mobile Web")
        if val == cls.DESKTOP_WEB:
            return _("Desktop Web")
        if val == cls.PUBLIC_API:
            return _("Public API")
        return _("Unknown")


class MobileType:
    ANDROID = 0
    IOS = 1

    @classmethod
    def get_list_labels(cls):
        return [dict(label=name, value=id) for id, name in MOBILE_TYPES]


MOBILE_TYPES = [
    (MobileType.ANDROID, "Android"),
    (MobileType.IOS, "IOS"),
]
