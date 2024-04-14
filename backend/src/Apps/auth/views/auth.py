from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
import jwt
from datetime import datetime, timedelta

from src.Apps.base.constants.http import HttpMethod


class AuthViewSet(viewsets.ViewSet):
    view_set = "auth"

    @action(detail=False, methods=[HttpMethod.POST], url_path="login")
    def auth_login(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')

        user = authenticate(email=email, password=password)

        if user is not None:
            exp = datetime.utcnow() + timedelta(seconds=settings.JWT_TOKEN_EXPIRED_TIME)
            payload = {
                'user_id': user.id,
                'exp': exp
            }
            access_token = jwt.encode(payload, key=settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

            return Response({'access_token': access_token, 'exp': exp}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
