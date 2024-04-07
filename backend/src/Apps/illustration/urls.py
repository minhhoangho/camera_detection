

from django.urls import path

from src.Apps.illustration.views import log, ping, sentry_debug

app_name = "main"

urlpatterns = [
    path("", ping, name="ping"),
    path("logs", log, name="log"),
    path("sentry_debug", sentry_debug, name="sentry_debug"),
]
