from django.urls import include, path
from rest_framework import routers

from src.Apps.user.views.user import UserViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r"users", UserViewSet, basename="user_viewset")



urlpatterns = [
    path("api/v1/", include(router.urls)),
]
