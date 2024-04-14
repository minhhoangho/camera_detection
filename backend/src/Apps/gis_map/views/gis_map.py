from http import HTTPStatus

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.request import Request
from rest_framework.response import Response

from src.Apps.gis_map.services.gis_map import GisMapService
from src.Apps.base.views.mixins import PaginationMixin, GenericViewMixin


class GisMapViewSet(PaginationMixin):
    def list(self, request: Request, *args, **kwargs):
        return Response(data=[], status=HTTPStatus.OK)
