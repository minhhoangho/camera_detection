from typing import Any

from django.utils.translation import gettext_lazy as _


class ApiErr:
    SERVER_ERROR = {"code": 1000, "message": _("A server error occurred.")}
    PARSE_ERROR = {"code": 1001, "message": _("Malformed request.")}
    AUTHENTICATION_FAILED = {
        "code": 1002,
        "message": _("Incorrect authentication credentials."),
    }
    NOT_AUTHENTICATED = {
        "code": 1003,
        "message": _("Authentication credentials were not provided."),
    }
    PERMISSION_DENIED = {
        "code": 1004,
        "message": _("You do not have permission to perform this action."),
    }
    NOT_FOUND = {"code": 1005, "message": _("{0} is not found.")}
    METHOD_NOT_ALLOWED = {"code": 1006, "message": _("Method not allowed.")}
    NOT_ACCEPTABLE = {
        "code": 1007,
        "message": _("Could not satisfy the request Accept header."),
    }
    UNSUPPORTED_MEDIA_TYPE = {
        "code": 1008,
        "message": _("Unsupported this media type in request."),
    }
    THROTTLED = {"code": 1009, "message": _("Request was throttled.")}
    BAD_HEADER_PARAMS = {"code": 1010, "message": _("Invalid request headers")}
    TOKEN_EXPIRED = {"code": 1011, "message": _("Token expired")}
    UNEXPECTED_ERROR = {"code": 1012, "message": "{0}"}
    CUSTOM_EXCEPTION = {"code": 1013, "message": "{0}"}
    BAD_REQUEST = {"code": 1014, "message": _("Bad request.")}
    INVALID_REQUEST = {"code": 1015, "message": _("Invalid request.")}
    CONFLICT = {"code": 1016, "message": _("{0} already exists")}
    DOES_NOT_SUPPORTED = {"code": 1018, "message": _("This API does not support yet")}


COMMON_ERROR_MESSAGES = {
    "REQUIRED": "This field is required.",
    "NULL": "This field may not be null.",
    "EMPTY": "This field may not be blank.",
    "UNIQUE": "must be unique",
    "ALREADY_IN_USE": "already in use.",
    "DOES_NOT_EXIST": "does not exist.",
    "MAX_LENGTH": "Ensure this field has no more than",
    "MIN_LENGTH": "Ensure this field has at least",
    "MAX_STRING_LENGTH": "String value too large.",
    "MAX_VALUE": "Ensure this value is less than or equal to",
    "MIN_VALUE": "Ensure this value is greater than or equal",
    "MAX_DECIMAL_VALUE": "Ensure that there are no more than",
    "DATE": "Expected a datetime but got a date.",
    "DATETIME": "Expected a date but got a datetime.",
    "NOT_A_LIST": "Expected a list of items but got type",
    "NOT_A_DICT": "Expected a dictionary of items but got type",
    "INVALID": "is invalid.",
    "INVALID_BOOLEAN": "Must be a valid boolean.",
    "INVALID_EMAIL": "Enter a valid email address.",
    "INVALID_REGEX": "This value does not match the required pattern.",
    "INVALID_SLUG": 'Enter a valid "slug" consisting of letters, numbers, underscores or hyphens.',
    "INVALID_URL": "Enter a valid URL.",
    "INVALID_UUID": "is not a valid UUID.",
    "INVALID_IP_ADDRESS": "Enter a valid IPv4 or IPv6 address.",
    "INVALID_INTEGER": "A valid integer is required.",
    "INVALID_NUMBER": "A valid number is required.",
    "INVALID_DATE": "Date has wrong format. Use one of these formats instead:",
    "INVALID_TIME": "Time has wrong format. Use one of these formats instead:",
    "INVALID_DATETIME": "Datetime has wrong format. Use one of these formats instead:",
    "INVALID_DURATION": "Duration has wrong format. Use one of these formats instead:",
    "INVALID_CHOICE": "is not a valid choice.",
    "INVALID_FILE": "The submitted data was not a file. Check the encoding type on the form.",
    "INVALID_FILE_PATH": "is not a valid path choice.",
    "INVALID_IMAGE": "Upload a valid image. The file you uploaded was either not an image or a corrupted image.",
    "INVALID_JSON": "Value must be valid JSON.",
    "NO_FILE_NAME": "No filename could be determined.",
    "REQUIRED_FILE": "No file was submitted.",
    "EMPTY_FILE": "The submitted file is empty.",
    "EMPTY_LIST": "This list may not be empty.",
    "EMPTY_CHOICE": "This selection may not be empty.",
    "UNIQUE_SET": "must make a unique set",
    "INVALID_STRING": "Not a valid string.",
}
