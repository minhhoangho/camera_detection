from django.urls import include, path
from rest_framework import routers

from src.Apps.approval.views.approval_flow import ApprovalFlowViewset

router = routers.SimpleRouter(trailing_slash=False)
router.register(r"approvals", ApprovalFlowViewset, basename="ApprovalFlow")



urlpatterns = [
    path("api/v1/", include(router.urls)),
]
