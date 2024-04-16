from src.settings.components import config

ALLOWED_HOST = [
    config("DOMAIN_NAME"),
    "localhost",
    "0.0.0.0",  # noqa: S104
    "127.0.0.1",
    "[::1]",
]
#
# SECURE_CROSS_ORIGIN_OPENER_POLICY = "cross-site"
# SECURE_REFERRER_POLICY = "origin-when-cross-origin"
SECURE_REFERRER_POLICY =  None

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:3001",
    "http://localhost:3001",
]
