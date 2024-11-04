from django.urls import include, path
from rest_framework import routers

from src.Apps.detector.views import DetectorViewSet, BenchmarkViewSet

router = routers.SimpleRouter(trailing_slash=False)
router.register(r"detector", DetectorViewSet, basename="detector_viewset")
router.register(r"benchmark", BenchmarkViewSet, basename="benchmark_viewset")

urlpatterns = [
    path("api/v1/", include(router.urls)),
]
