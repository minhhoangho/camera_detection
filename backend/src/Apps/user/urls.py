from django.urls import include, path
from rest_framework import routers

# from src.Apps.user.views.approval_flow import ApprovalFlowViewset

router = routers.SimpleRouter(trailing_slash=False)
# router.register(r"users", ApprovalFlowViewset, basename="ApprovalFlow")



urlpatterns = [
    path("api/v1/", include(router.urls)),
]
