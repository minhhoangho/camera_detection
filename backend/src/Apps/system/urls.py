from django.urls import path

from src.Apps.system.views import ping, healthcheck

app_name = "main"

urlpatterns = [
    path("health-check", healthcheck, name="healthcheck"),
    path("", ping, name="ping"),
]
