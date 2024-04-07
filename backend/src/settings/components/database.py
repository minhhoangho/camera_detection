"""
This file contains a definition for database configurations.
Read more about it:
https://docs.djangoproject.com/en/4.0/ref/databases/#databases
For the full list of settings and their config, see
https://docs.djangoproject.com/en/4.0/ref/databases/#connecting-to-the-database
"""

from src.settings.components import config


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("MYSQL_DATABASE"),
        "USER": config("MYSQL_USER"),
        "PASSWORD": config("MYSQL_PASSWORD"),
        "HOST": config("DJANGO_DATABASE_HOST"),
        "PORT": config("DJANGO_DATABASE_PORT", cast=int),
        "CONN_MAX_AGE": config("CONN_MAX_AGE", cast=int, default=60),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET NAMES 'utf8mb4'; SET MAX_EXECUTION_TIME=30000",
        },
    },
}
