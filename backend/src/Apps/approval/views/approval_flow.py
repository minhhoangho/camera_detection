from rest_framework import status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from src.Apps.base.views.mixins import GenericViewMixin


class ApprovalFlowViewset(GenericViewMixin):
    view_set = "ApprovalFlow"
    permission_classes = ()


    @action(detail=False, methods=["GET"])
    def init(self, request: Request):
        return Response(status=status.HTTP_400_BAD_REQUEST)


    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_400_BAD_REQUEST)
