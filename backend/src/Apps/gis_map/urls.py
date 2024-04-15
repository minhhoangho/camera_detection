from django.urls import include, path
from rest_framework import routers

from src.Apps.gis_map.views.gis_map import GisMapViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r"gis-maps", GisMapViewSet, basename="gis_map_viewset")

urlpatterns = [
    path("api/v1/", include(router.urls)),
]
