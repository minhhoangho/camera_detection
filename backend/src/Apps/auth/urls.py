from django.urls import include, path
from rest_framework import routers

from src.Apps.auth.views.auth import AuthViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r"auth", AuthViewSet, basename="auth_viewset")



urlpatterns = [
    path("api/v1/", include(router.urls)),
]
