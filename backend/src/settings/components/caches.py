#!/usr/bin/env python

# Caching
# https://docs.djangoproject.com/en/4.0/topics/cache/

from src.settings.components import config

REDIS_HOST = config("REDIS_HOST", default="127.0.0.1")
REDIS_HOST_REPLICA = config("REDIS_HOST_REPLICA", default=REDIS_HOST)
REDIS_PORT = config("REDIS_PORT", default="6379")
REDIS_PWD = config("REDIS_PWD", default="")
REDIS_DATA_MAX_CONNECTIONS = config("REDIS_DATA_MAX_CONNECTIONS", default=5000)
REDIS_SSL = bool(config("REDIS_SSL", default=0, cast=int))
# DEFAULT REDIS EXPIRE TIME: 1 day
REDIS_DEFAULT_EXPIRE_TIME = config("REDIS_DEFAULT_EXPIRE_TIME", default=86400)
# DEFAULT_MAX_EXPIRE_TIME: 30 days
REDIS_DEFAULT_MAX_EXPIRE_TIME = config("REDIS_DEFAULT_MAX_EXPIRE_TIME", default=2592000)

HASH_CHUNK_SIZE = config("HASH_CHUNK_SIZE", default=20, cast=int)

def _get_url_scheme(ssl_enable: bool = True) -> str:
    return "rediss" if ssl_enable else "redis"


REDIS_URL_SCHEME = _get_url_scheme(REDIS_SSL)


# CACHE NAME
REDIS_DATA_CACHE_SETTING_NAME = "redis_data_cache"
MODEL_CACHE_SETTING_NAME = "redis_model_cache"
REDIS_LRU_CACHE_SETTING_NAME = "redis_lru_cache"

BASE_REDIS_OPTIONS = {
    "CLIENT_CLASS": "django_redis.client.DefaultClient",
    "PICKLE_VERSION": -1,
    "SOCKET_CONNECT_TIMEOUT": 5,  # seconds
    "SOCKET_TIMEOUT": 5,  # seconds
    "CONNECTION_POOL_KWARGS": {
        "max_connections": REDIS_DATA_MAX_CONNECTIONS,
        "retry_on_timeout": True,
    },
    "PASSWORD": f"{REDIS_PWD}",
    "IGNORE_EXCEPTIONS": True,
}

BASE_REDIS_SETTINGS = {
    "BACKEND": "django_redis.cache.RedisCache",
    "LOCATION": [
        f"{REDIS_URL_SCHEME}://{REDIS_HOST}:{REDIS_PORT}",  # Primary
        f"{REDIS_URL_SCHEME}://{REDIS_HOST_REPLICA}:{REDIS_PORT}",  # Secondary
    ],
    "TIMEOUT": 86400,  # Default timeout 24 * 60 * 60
    "OPTIONS": {**BASE_REDIS_OPTIONS},
}

CACHES = {
    "default": {**BASE_REDIS_SETTINGS},
    MODEL_CACHE_SETTING_NAME: {**BASE_REDIS_SETTINGS},
    REDIS_DATA_CACHE_SETTING_NAME: {**BASE_REDIS_SETTINGS},
    REDIS_LRU_CACHE_SETTING_NAME: {**BASE_REDIS_SETTINGS},
}


# django-axes
# https://django-axes.readthedocs.io/en/latest/4_configuration.html#configuring-caches

AXES_CACHE = "default"
