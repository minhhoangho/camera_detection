from http import HTTPStatus

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.request import Request
from rest_framework.response import Response

from src.Apps.user.services.user import UserService
from src.Apps.user.views.mixin import UserViewMixin


class UserViewSet(UserViewMixin):
    def list(self, request: Request, *args, **kwargs):
        print(request.query_params)
        page = int(request.query_params.get("page", 1))
        per_page = int(request.query_params.get("per_page", 10))
        data, count = UserService.list_paginate(page=page, per_page=per_page)
        result = self.to_list(items=data, total=count, limit=per_page, offset=(page - 1) * per_page, page=page,
                              with_paginate=True)
        return Response(data=result, status=HTTPStatus.OK)
