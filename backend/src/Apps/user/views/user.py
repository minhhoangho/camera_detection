from http import HTTPStatus

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.request import Request
from rest_framework.response import Response

from src.Apps.base.views.mixins import PaginationMixin
from src.Apps.user.services.user import UserService


class UserViewSet(PaginationMixin):
    def list(self, request: Request, *args, **kwargs):
        limit = int(request.query_params.get("limit", 10))
        offset = int(request.query_params.get("offset", 0))
        page = offset // limit + 1
        data, count = UserService.list_paginate(page=page, per_page=limit)
        result = self.to_list(items=data, total=count, limit=limit, offset=offset, page=page,
                              with_paginate=True)
        return Response(data=result, status=HTTPStatus.OK)


    def create(self, request: Request, *args, **kwargs):
        data = request.data
        user = UserService.create(data)
        return Response(data=user, status=HTTPStatus.CREATED)
