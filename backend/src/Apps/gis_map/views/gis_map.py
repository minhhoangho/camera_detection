from http import HTTPStatus

from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from src.Apps.base.constants.http import HttpMethod
from src.Apps.base.exceptions import AppException, ApiErr
from src.Apps.base.exceptions.validation_error import ValidationErr
from src.Apps.base.utils.type_utils import TypeUtils
from src.Apps.gis_map.models import GisViewPoint
from src.Apps.gis_map.serializers.gis_map import (
    ViewPointSerializer,
    CUViewPointSerializer, CUCameraViewPointSerializer, CameraViewPointSerializer,
)
from src.Apps.gis_map.services.gis_map import GisMapService
from src.Apps.base.views.mixins import PaginationMixin


class GisMapViewSet(PaginationMixin):

    @action(methods=[HttpMethod.GET, HttpMethod.POST], url_path="view-points", detail=False)
    def view_points(self, request: Request, *args, **kwargs):
        if HttpMethod.is_get(request.method):
            return self.list_view_points(request, *args, **kwargs)
        elif HttpMethod.is_post(request.method):
            return self.create_view_point(request, *args, **kwargs)
        return Response(status=HTTPStatus.NOT_FOUND)

    def list_view_points(self, request: Request, *args, **kwargs):
        limit = int(request.query_params.get("limit", 10))
        offset = int(request.query_params.get("offset", 0))
        page = offset // limit + 1
        data, count = GisMapService.list_view_points_paginate(page=page, per_page=limit)
        result = self.to_list(
            items=data,
            total=count,
            limit=limit,
            offset=offset,
            page=page,
            with_paginate=True,
        )
        return Response(data=result, status=HTTPStatus.OK)

    def create_view_point(self, request: Request, *args, **kwargs):
        payload = request.data.copy()
        serializer = CUViewPointSerializer(data=payload)
        if serializer.is_valid(raise_exception=True):
            view_point = GisViewPoint(**payload)
            view_point.save()
        return Response(data=ViewPointSerializer(view_point).data, status=HTTPStatus.OK)

    @action(methods=[HttpMethod.PUT, HttpMethod.GET], url_path=r"view-points/(?P<pk>\w+)", detail=False)
    def view_point_detail(self, request: Request, pk):
        if HttpMethod.is_put(request.method):
            return self.update_view_point(request, pk)
        if HttpMethod.is_get(request.method):
            return self.get_view_point_detail(request, pk)
        return Response(status=HTTPStatus.NOT_FOUND)

    def get_view_point_detail(self, request: Request, pk):
        pk = TypeUtils.safe_int(pk)
        if not pk:
            raise AppException(error=ValidationErr.INVALID, params=["pk"])
        gis_vp = GisViewPoint.objects.filter(pk=pk).first()
        if not gis_vp:
            raise AppException(error=ApiErr.NOT_FOUND)
        return Response(data=ViewPointSerializer(gis_vp).data, status=HTTPStatus.OK)

    def update_view_point(self, request: Request, pk):
        pk = TypeUtils.safe_int(pk)
        if not pk:
            raise AppException(error=ValidationErr.INVALID, params=["pk"])

        lat = request.data.get("lat")
        long = request.data.get("long")
        payload = {"lat": lat, "long": long}
        serializer = ViewPointSerializer(data=payload)
        if serializer.is_valid(raise_exception=True):
            gis_vp = GisViewPoint.objects.filter(pk=pk).first()
            if not gis_vp:
                raise AppException(error=ApiErr.NOT_FOUND)
            gis_vp.lat = lat
            gis_vp.long = long
            gis_vp.save()
        return Response(data=ViewPointSerializer(gis_vp).data, status=HTTPStatus.OK)

    @action(methods=[HttpMethod.GET], url_path=r"view-points/(?P<pk>\w+)/cameras", detail=False)
    def get_list_vp_cameras(self, request: Request, pk):
        limit = int(request.query_params.get("limit", 10))
        offset = int(request.query_params.get("offset", 0))
        page = offset // limit + 1
        view_point_id = TypeUtils.safe_int(pk)
        if not view_point_id:
            raise AppException(error=ValidationErr.INVALID, params=["view_point_id"])
        data, count = GisMapService.list_camera_paginate(view_point_id, page=page, per_page=limit)
        result = self.to_list(
            items=data,
            total=count,
            limit=limit,
            offset=offset,
            page=page,
            with_paginate=True,
        )
        return Response(data=result, status=HTTPStatus.OK)

    @action(methods=[HttpMethod.POST], url_path=r"view-points/(?P<pk>\w+)/camera", detail=False)
    def config_camera_source_for_viewpoint(self, request: Request, pk):
        payload = request.data.copy()
        view_point_id = TypeUtils.safe_int(pk)
        payload.update(view_point_id=view_point_id)
        serializer = CUCameraViewPointSerializer(data=payload)
        result = None
        if serializer.is_valid(raise_exception=True):
            pk = TypeUtils.safe_int(payload.pop("id", None))
            if pk:
                result = GisMapService.edit_view_point_camera(pk=pk, payload=payload)
            else:
                result = GisMapService.create_view_point_camera(payload)
        return Response(data=CameraViewPointSerializer(result).data, status=HTTPStatus.OK)
