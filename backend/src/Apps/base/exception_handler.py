from django.db import connection, transaction
from django.http import Http404
from requests import Response
from rest_framework import exceptions, status
from rest_framework.exceptions import PermissionDenied

from src.Apps.base.exceptions import AppException, EmptyThrottled, AppExceptions, ApiErr, BadHeaderParams, TokenExpired
from src.Apps.base.exceptions.error import REST_ERROR_MESSAGES
from src.Apps.base.logging.application_log import AppLog


def get_error_label(error_message):
    for label in REST_ERROR_MESSAGES:
        if error_message.find(REST_ERROR_MESSAGES[label]) >= 0:
            return label
    return None


def get_all_errors(field_name, current_errors, rest_errors=[], olivia_errors=[]):
    if isinstance(current_errors, dict):
        if (
            len(current_errors) == 3
            and "code" in current_errors
            and "message" in current_errors
            and "field" in current_errors
        ):
            error_code = (
                current_errors["code"][0] if isinstance(current_errors["code"], list) else current_errors["code"]
            )
            error_message = (
                current_errors["message"][0]
                if isinstance(current_errors["message"], list)
                else current_errors["message"]
            )
            error_field = (
                current_errors["field"][0] if isinstance(current_errors["field"], list) else current_errors["field"]
            )
            if error_field.strip() != "":
                error_field = error_field if field_name == "" else f"{field_name}.{error_field}"
            else:
                error_field = field_name
            olivia_errors.append({"code": error_code, "field": error_field, "message": error_message})
        else:
            for field in current_errors:
                sub_field_name = field if field_name == "" else f"{field_name}.{field}"
                get_all_errors(sub_field_name, current_errors[field], rest_errors, olivia_errors)

    if isinstance(current_errors, list):
        # Case raise errors serializer (many=true) msg return to FE empty
        # Ex: current_errors = [{}, {'file_url': 'Ensure this field has no more than 255 characters.'}]
        # When we get current_errors[0], the error will empty(But we use default [{}] to avoid errors current_errors[0])
        current_errors = list(filter(None, current_errors)) or [{}]
        if isinstance(current_errors[0], dict):
            get_all_errors(field_name, current_errors[0], rest_errors, olivia_errors)
        else:
            if isinstance(current_errors[0], exceptions.ErrorDetail):
                code = current_errors[0].code
            else:
                code = None
            rest_errors.append({"field": field_name, "message": str(current_errors[0]), "code": code})


def parser_error_to_list(exc):
    errors = []
    rest_errors = []
    olivia_errors = []
    get_all_errors("", exc.detail, rest_errors, olivia_errors)
    for error in rest_errors:
        if error["field"] != "":
            error_label = get_error_label(error["message"])
            if error_label:
                error_code = getattr(ValidationErr, error_label)["code"]
                error_message = getattr(ValidationErr, error_label)["message"]

                if error_code in [
                    ValidationErr.MAX_LENGTH["code"],
                    ValidationErr.MIN_LENGTH["code"],
                    ValidationErr.MAX_VALUE["code"],
                    ValidationErr.MIN_VALUE["code"],
                ]:
                    value = extract_number_from_string(error["message"])
                    error_message = error_message.format(error["field"], value)
                elif error_code == ValidationErr.UNIQUE_SET["code"]:
                    error_message = error["message"]
                    error["field"] = ""
                else:
                    error_message = error_message.format(error["field"])

                errors.append({"code": error_code, "message": error_message, "field": error["field"]})
            else:
                errors.append(error)

    for error in olivia_errors:
        errors.append(
            {
                "code": int(error["code"], error["code"]),
                "message": error["message"],
                "field": error["field"],
            }
        )
    return errors


def set_rollback():
    """
    set_rollback https://github.com/encode/django-rest-framework/pull/5591/files
    """
    atomic_requests = connection.settings_dict.get("ATOMIC_REQUESTS", False)
    if atomic_requests and connection.in_atomic_block:
        transaction.set_rollback(True)


def app_exception_handler(exc, context):
    """
    Returns the response that should be used for any given exception.

    By default we handle the REST framework `APIException`, and also
    Django's built-in `Http404` and `PermissionDenied` exceptions.

    Any unhandled exceptions may return `None`, which will cause a 500 error
    to be raised.
    """
    if isinstance(exc, AppException):
        errors = [{"code": exc.error["code"], "message": exc.error["message"], "field": exc.field}]

        data = {"errors": errors}

        set_rollback()
        return Response(data, status=exc.status_code)


    elif isinstance(exc, AppExceptions):
        errors = []
        for error in exc.errors:
            if isinstance(error, AppException):
                errors.append({"code": error.error["code"], "message": error.error["message"], "field": error.field})

        data = {"errors": errors}

        set_rollback()
        return Response(data, status=AppException.status_code)

    elif isinstance(exc, exceptions.ValidationError):
        errors = parser_error_to_list(exc)
        data = {"errors": errors}

        set_rollback()
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    elif isinstance(exc, exceptions.APIException):
        headers = {}
        if getattr(exc, "auth_header", None):
            headers["WWW-Authenticate"] = exc.auth_header
        if getattr(exc, "wait", None):
            # noinspection PyUnresolvedReferences
            headers["Retry-After"] = "%d" % exc.wait

        use_default_value = True if isinstance(exc.detail, (list, dict)) else False

        if isinstance(exc, exceptions.ParseError):
            message = ApiErr.PARSE_ERROR["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.PARSE_ERROR["code"], "message": message}
        elif isinstance(exc, exceptions.AuthenticationFailed):
            message = ApiErr.AUTHENTICATION_FAILED["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.AUTHENTICATION_FAILED["code"], "message": message}
        elif isinstance(exc, exceptions.NotAuthenticated):
            message = ApiErr.NOT_AUTHENTICATED["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.NOT_AUTHENTICATED["code"], "message": message}
        elif isinstance(exc, exceptions.PermissionDenied):
            message = ApiErr.PERMISSION_DENIED["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.PERMISSION_DENIED["code"], "message": message}
        elif isinstance(exc, exceptions.NotFound):
            message = ApiErr.NOT_FOUND["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.NOT_FOUND["code"], "message": message}
        elif isinstance(exc, exceptions.MethodNotAllowed):
            message = ApiErr.METHOD_NOT_ALLOWED["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.METHOD_NOT_ALLOWED["code"], "message": message}
        elif isinstance(exc, exceptions.NotAcceptable):
            message = ApiErr.NOT_ACCEPTABLE["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.NOT_ACCEPTABLE["code"], "message": message}
        elif isinstance(exc, exceptions.UnsupportedMediaType):
            message = ApiErr.UNSUPPORTED_MEDIA_TYPE["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.UNSUPPORTED_MEDIA_TYPE["code"], "message": message}
        elif isinstance(exc, exceptions.Throttled):
            message = ApiErr.THROTTLED["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.THROTTLED["code"], "message": message}
        elif isinstance(exc, BadHeaderParams):
            message = ApiErr.BAD_HEADER_PARAMS["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.BAD_HEADER_PARAMS["code"], "message": message}
        elif isinstance(exc, TokenExpired):
            message = ApiErr.TOKEN_EXPIRED["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.TOKEN_EXPIRED["code"], "message": message}
        else:
            AppLog.project.critical(exc, exc_info=True)
            message = ApiErr.SERVER_ERROR["message"] if use_default_value else exc.detail
            error = {"code": ApiErr.SERVER_ERROR["code"], "message": message}

        error["field"] = ""
        data = {"errors": [error]}

        set_rollback()
        return Response(data, status=exc.status_code, headers=headers)

    elif isinstance(exc, Http404):
        data = {"errors": [{"code": ApiErr.NOT_FOUND["code"], "message": ApiErr.NOT_FOUND["message"], "field": ""}]}

        set_rollback()
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    elif isinstance(exc, PermissionDenied):
        data = {
            "errors": [
                {"code": ApiErr.PERMISSION_DENIED["code"], "message": ApiErr.PERMISSION_DENIED["message"], "field": ""}
            ]
        }

        set_rollback()
        return Response(data, status=status.HTTP_403_FORBIDDEN)
    else:
        AppLog.project.critical(exc, exc_info=True)
        data = {
            "errors": [{"code": ApiErr.SERVER_ERROR["code"], "message": ApiErr.SERVER_ERROR["message"], "field": ""}]
        }

        set_rollback()
        return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Note: Unhandled exceptions will raise a 500 error.
    return None
