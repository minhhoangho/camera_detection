import copy
import os
import re
import tempfile
from datetime import timedelta
from typing import Dict, List

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.paginator import EmptyPage, Paginator
from django.db import transaction
from django.db.models import Q

from src.Apps.base.exceptions import AppException, ApiErr
from src.Apps.base.utils.type_utils import TypeUtils
from src.Apps.detector.services.detector_service import DetectorService
from src.Apps.gis_map.models import GisViewPoint, GisViewPointCamera, GisMapView

UserModel = get_user_model()


class GisMapService:
    @classmethod
    def list_view_points_paginate(cls, page: int, per_page: int = 10, order_by: str = "-created_at", keyword: str = ""):
        qs = GisViewPoint.objects
        if keyword:
            qs = qs.filter(Q(name__icontains=keyword))
        qs = qs.order_by(order_by)
        paginator = Paginator(qs, per_page)
        total = paginator.count
        try:
            data = paginator.page(page).object_list
            data = data.values()
        except EmptyPage:
            data = []
        return data, total

    @classmethod
    def get_view_point_by_id(cls, pk: int, raise_exception: bool = True) -> GisViewPoint:
        vp = GisViewPoint.objects.filter(id=pk).first()
        if not vp:
            raise AppException(error=ApiErr.NOT_FOUND, params="View Point")

        return vp

    @classmethod
    def list_camera_paginate(cls, view_point_id: int, page: int, per_page: int = 10):
        qs = GisViewPointCamera.objects.filter(view_point_id=view_point_id)
        paginator = Paginator(qs, per_page)
        total = paginator.count
        try:
            data = paginator.page(page).object_list
            data = data.values()
        except EmptyPage:
            data = []
        return data, total

    @classmethod
    def get_view_point_camera_detail(cls, pk: int, raise_exception: bool = True) -> GisViewPointCamera:
        cm = GisViewPointCamera.objects.filter(id=pk).first()
        if not cm:
            raise AppException(error=ApiErr.NOT_FOUND, params="View Point Camera")

        return cm

    @classmethod
    def create_view_point_camera(cls, payload: dict) -> GisViewPointCamera:
        view_point_id: int = TypeUtils.safe_int(payload.get("view_point_id"))
        view_point = cls.get_view_point_by_id(view_point_id)
        camera_source: int = TypeUtils.safe_int(payload.get("camera_source"))
        camera_uri: str = TypeUtils.safe_str(payload.get("camera_uri"))
        res = GisViewPointCamera.objects.create(
            view_point_id=view_point_id, camera_source=camera_source, camera_uri=camera_uri
        )
        cls._save_captured_image(view_point=view_point, cam_detail=res)
        return GisViewPointCamera.objects.get(id=res.id)

    @classmethod
    def edit_view_point_camera(cls, pk: int, payload: dict) -> GisViewPointCamera:
        cam_detail = cls.get_view_point_camera_detail(pk=pk)
        view_point_id: int = TypeUtils.safe_int(payload.get("view_point_id"))
        view_point = cls.get_view_point_by_id(view_point_id)
        camera_source: int = TypeUtils.safe_int(payload.get("camera_source"))
        camera_uri: str = TypeUtils.safe_str(payload.get("camera_uri"))
        GisViewPointCamera.objects.filter(id=pk).update(
            view_point_id=view_point_id, camera_source=camera_source, camera_uri=camera_uri
        )
        cls._save_captured_image(view_point=view_point, cam_detail=cam_detail)
        return cls.get_view_point_camera_detail(pk=pk)

    @classmethod
    def _save_captured_image(cls, view_point: GisViewPoint, cam_detail: GisViewPointCamera):
        file_name = f"{view_point.name}_{cam_detail.id}"
        s3_url = DetectorService.handle_capture_video_and_upload_s3(video_url=cam_detail.camera_uri, file_name=file_name)
        GisViewPointCamera.objects.filter(id=cam_detail.id).update(captured_image=s3_url)

    @classmethod
    def delete_viewpoint_camera(cls, pk: int):
        GisViewPointCamera.objects.filter(id=pk).delete()
        return True

    @classmethod
    def create_or_update_map_view(cls, **map_view) -> GisMapView:
        lat: float = TypeUtils.safe_float(map_view.get("lat"))
        long: float = TypeUtils.safe_float(map_view.get("long"))
        zoom: float = TypeUtils.safe_float(map_view.get("zoom"))
        view_point_id: int = TypeUtils.safe_int(map_view.get("view_point_id"))
        cls.get_view_point_by_id(view_point_id)
        if GisMapView.objects.filter(view_point_id=view_point_id).exists():
            GisMapView.objects.filter(view_point_id=view_point_id).update(lat=lat, long=long, zoom=zoom)
            return GisMapView.objects.filter(view_point_id=view_point_id).first()
        return GisMapView.objects.create(lat=lat, long=long, zoom=zoom, view_point_id=view_point_id)
