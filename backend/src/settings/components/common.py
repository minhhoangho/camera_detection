"""
Django settings for src project.
For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/
For the full list of settings and their config, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""

from typing import Dict, List, Tuple, Union

from django.utils.translation import gettext_lazy as _

from src.settings.components import BASE_DIR, config

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

SECRET_KEY = config("DJANGO_SECRET_KEY")

# Application definition:

INSTALLED_APPS: Tuple[str, ...] = (
    # Your apps go here:
    "src.Apps.system",
    "src.Apps.user",
    "src.Apps.gis_map",
    # Default django apps:
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # django-admin:
    "django.contrib.admin",
    "django.contrib.admindocs",
    # Security:
    "axes",
    # Health checks:
    # You may want to enable other checks as well,
    # see: https://github.com/KristianOellegaard/django-health-check
    "health_check",
    "health_check.db",
    "health_check.cache",
    "health_check.contrib.migrations",
    "rest_framework",
    # "health_check.storage",
    # "health_check.contrib.celery",              # requires celery
    # "health_check.contrib.celery_ping",         # requires celery
    # "health_check.contrib.psutil",              # disk and memory utilization; requires psutil
    # "health_check.contrib.s3boto3_storage",     # requires boto3 and S3BotoStorage backend
    # "health_check.contrib.rabbitmq",            # requires RabbitMQ broker
    # "health_check.contrib.redis",               # requires Redis broker
)

MIDDLEWARE: Tuple[str, ...] = (
    # Content Security Policy:
    "csp.middleware.CSPMiddleware",
    # Django:
    "django.middleware.security.SecurityMiddleware",
    # django-permissions-policy
    "django_permissions_policy.PermissionsPolicyMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # Axes:
    "axes.middleware.AxesMiddleware",
    # Django HTTP Referrer Policy:
    "django_http_referrer_policy.middleware.ReferrerPolicyMiddleware",
)

ROOT_URLCONF = "src.urls"

WSGI_APPLICATION = "src.wsgi.application"

# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = "en-us"

USE_I18N = True

LANGUAGES = (
    ("en", _("English")),
    ("ru", _("Russian")),
)

LOCALE_PATHS = ("locale/",)

USE_TZ = True
TIME_ZONE = "UTC"

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = "/static/"

STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
)

# Templates
# https://docs.djangoproject.com/en/4.0/ref/templates/api

TEMPLATES = [
    {
        "APP_DIRS": True,
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            # Contains plain text templates, like `robots.txt`:
            BASE_DIR.joinpath("src", "templates"),
        ],
        "OPTIONS": {
            "context_processors": [
                # Default template context processors:
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.debug",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.contrib.messages.context_processors.messages",
                "django.template.context_processors.request",
            ],
        },
    }
]

# Media files
# Media root dir is commonly changed in production
# (see development.py and production.py).
# https://docs.djangoproject.com/en/4.0/topics/files/

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR.joinpath("media")

# Django authentication system
# https://docs.djangoproject.com/en/4.0/topics/auth/


PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.BCryptPasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.Argon2PasswordHasher",
]

# Security
# https://docs.djangoproject.com/en/4.0/topics/security/

SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True

X_FRAME_OPTIONS = "DENY"

# https://github.com/DmytroLitvinov/django-http-referrer-policy
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
REFERRER_POLICY = "same-origin"

# https://github.com/adamchainz/django-permissions-policy#setting
PERMISSIONS_POLICY: Dict[str, Union[str, List[str]]] = {}  # noqa: WPS234

# Timeouts
# https://docs.djangoproject.com/en/4.0/ref/settings/#std:setting-EMAIL_TIMEOUT

EMAIL_TIMEOUT = 5

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

APPEND_SLASH = False
