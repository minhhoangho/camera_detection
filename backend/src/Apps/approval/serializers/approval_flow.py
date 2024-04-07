
__author__ = "minhhoangho99@gmail.com"
__date__ = "Oct 06, 2023 14:01"

from src.Apps.base.serializers import ServiceSerializer


class ApprovalFlowSerializer(ServiceSerializer):
    class Meta:
        model = ApprovalFlow
