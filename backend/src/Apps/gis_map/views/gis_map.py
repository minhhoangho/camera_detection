from http import HTTPStatus

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.request import Request
from rest_framework.response import Response

from src.Apps.base.exceptions import AppException, ApiErr
from src.Apps.base.utils.type_utils import TypeUtils
from src.Apps.gis_map.models import GisViewPoint
from src.Apps.gis_map.serializers.gis_map import ViewPointSerializer
from src.Apps.gis_map.services.gis_map import GisMapService
from src.Apps.base.views.mixins import PaginationMixin, GenericViewMixin


class GisMapViewSet(PaginationMixin):
    def list(self, request: Request, *args, **kwargs):
        return Response(data=[], status=HTTPStatus.OK)

    @action(methods=["POST"], url_path="view-points", detail=False)
    def create_view_point(self, request: Request, *args, **kwargs):
        lat = request.data.get('lat')
        long = request.data.get('long')
        payload = {
            "lat": lat,
            "long": long
        }
        serializer = ViewPointSerializer(data=payload)
        if serializer.is_valid(raise_exception=True):
            view_point = GisViewPoint(lat=lat, long=long)
            view_point.save()
        return Response(status=HTTPStatus.OK)

    @action(methods=["PUT"], url_path="view-points/(?P<pk>\w+)", detail=False)
    def update_view_point(self, request: Request, pk):
        pk = TypeUtils.safe_int(pk)
        if not pk:
            raise ValidationError("Invalid view point id")

        lat = request.data.get('lat')
        long = request.data.get('long')
        payload = {
            "lat": lat,
            "long": long
        }
        serializer = ViewPointSerializer(data=payload)
        if serializer.is_valid(raise_exception=True):
            gis_vp = GisViewPoint.objects.filter(pk=pk).first()
            if not gis_vp:
                raise AppException(error=ApiErr.NOT_FOUND)
            gis_vp.lat = lat
            gis_vp.long = long
            gis_vp.save()
        return Response(data=[], status=HTTPStatus.OK)

    @action(methods=["GET"], url_path="view-points", detail=False)
    def list_view_points(self, request: Request, *args, **kwargs):
        limit = int(request.query_params.get("limit", 10))
        offset = int(request.query_params.get("offset", 0))
        page = offset // limit + 1
        data, count = GisMapService.list_paginate(page=page, per_page=limit)
        result = self.to_list(items=data, total=count, limit=limit, offset=offset, page=page,
                              with_paginate=True)
        return Response(data=result, status=HTTPStatus.OK)

    @action(methods=["POST"], url_path=r"view-points/(?P<pk>\w+)/camera", detail=False)
    def config_camera_source_for_viewpoint(self, request: Request, pk):
        return Response(data=[], status=HTTPStatus.OK)
