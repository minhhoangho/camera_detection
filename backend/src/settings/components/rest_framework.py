REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "src.Apps.auth.services.token_authentication.AppAuthentication"
    ],
    "EXPIRED_FOREVER": "2000-10-10 00:00:00",
    "DEFAULT_THROTTLE_RATES": {
        "custom_user": "180/minute",
        "email_unsubscribe": "10/day",
        "hourly_requests": "12/hour",
        "auth_hourly_requests": "6/hour",
        "webhook_per_min_requests_by_sms": "15/minute",
        "webhook_per_min_requests_by_ip": "240/minute",
        "lowes_webhook_per_min_requests_by_ip": "3000000/hour",
        "checkr_hourly": "1/hour",
    },
    "OVERRIDE_THROTTLE_RATES": {"special": "10000/hour"},
    "EXCEPTION_HANDLER": "src.Apps.base.exception_handler.app_exception_handler",
}

REST_FRAMEWORK_CACHE = {
    "DEFAULT_CACHE_TIMEOUT": 86400,  # Default is 1 day
}
