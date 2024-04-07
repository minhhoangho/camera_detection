import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from src.settings.components import config

SENTRY_DSN = config("SENTRY_DSN", "")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True,
        environment=config("SENTRY_ENV"),
    )

