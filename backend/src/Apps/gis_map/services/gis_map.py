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

from src.Apps.gis_map.models import GisViewPoint

UserModel = get_user_model()


class GisMapService:
    @classmethod
    def list_paginate(cls, page: int, per_page: int = 10):
        qs = GisViewPoint.objects.filter()
        paginator = Paginator(qs, per_page)
        total = paginator.count
        try:
            data = paginator.page(page).object_list
            data = data.values()
        except EmptyPage:
            data = []
        return data, total
