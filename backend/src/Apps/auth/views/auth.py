from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
import jwt
from datetime import datetime, timedelta

from src.Apps.base.constants.http import HttpMethod
from src.Apps.base.exceptions import AppExceptions, AppException, ApiErr
from src.Apps.user.serializers.user import UserSerializer


class AuthViewSet(viewsets.ViewSet):
    view_set = "auth"

    @action(detail=False, methods=[HttpMethod.POST], url_path="login")
    def auth_login(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')

        user = authenticate(email=email, password=password)

        if not user:
            raise AppException(error=ApiErr.AUTHENTICATION_FAILED, status_code=status.HTTP_401_UNAUTHORIZED)
        exp = datetime.utcnow() + timedelta(seconds=settings.JWT_TOKEN_EXPIRED_TIME)

        user_data = UserSerializer(user).data

        payload = {
            'user_id': user.id,
            'email': user.email,
            'exp': exp
        }
        access_token = jwt.encode(payload, key=settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        data_res = dict(
            access_token=access_token,
            expiration_time=settings.JWT_TOKEN_EXPIRED_TIME,
            expire_at=exp,
            user=user_data
        )
        return Response(
            data=data_res, status=status.HTTP_200_OK)
