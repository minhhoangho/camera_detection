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
from src.Apps.gis_map.models import GisViewPoint, GisViewPointCamera

UserModel = get_user_model()


class GisMapService:
    @classmethod
    def list_view_points_paginate(cls, page: int, per_page: int = 10, order_by: str = "-created_at"):
        qs = GisViewPoint.objects.filter().order_by(order_by)
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
    def list_camera_paginate(cls, view_point_id: int,  page: int, per_page: int = 10):
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
        cls.get_view_point_by_id(view_point_id)
        camera_source: int = TypeUtils.safe_int(payload.get("camera_source"))
        camera_uri: str = TypeUtils.safe_str(payload.get("camera_uri"))
        return GisViewPointCamera.objects.create(
            view_point_id=view_point_id, camera_source=camera_source, camera_uri=camera_uri
        )

    @classmethod
    def edit_view_point_camera(cls, pk: int, payload: dict) -> GisViewPointCamera:
        cls.get_view_point_camera_detail(pk=pk)
        view_point_id: int = TypeUtils.safe_int(payload.get("view_point_id"))
        cls.get_view_point_by_id(view_point_id)
        camera_source: int = TypeUtils.safe_int(payload.get("camera_source"))
        camera_uri: str = TypeUtils.safe_str(payload.get("camera_uri"))
        GisViewPointCamera.objects.filter(id=pk).update(
            view_point_id=view_point_id, camera_source=camera_source, camera_uri=camera_uri
        )
        return cls.get_view_point_camera_detail(pk=pk)
