import jwt
from rest_framework import authentication, HTTP_HEADER_ENCODING, status
from rest_framework.exceptions import AuthenticationFailed

from src.Apps.auth.exception import AuthErr
from src.Apps.base.exceptions import AppException
from src.Apps.user.services.user import UserService


class AppAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):
        """Authenticate"""
        auth = self.get_authorization_header(request).split()

        if not auth or auth[0].decode().lower() != "bearer":
            return None

        try:
            token = auth[1].decode()
        except UnicodeError:
            raise AppException(status_code=status.HTTP_401_UNAUTHORIZED, error=AuthErr.TOKEN_CONTAINS_INVALID_CHARACTERS)
        print("Check token >>>>>")
        return self.jwt_authentication(token, request)
        # if is_bearer_request:
        #     return self.authenticate_bearer_credentials(token, request)
        # if is_public_request:
        #     return self.authenticate_public_credentials(token, request)
        # elif is_basic_request:
        #     return self.authenticate_basic_credentials(token, request)
        # return self.authenticate_api_credentials(token, request)
        # return user, token


    def jwt_authentication(self, token, request):
        opts = {"verify_aud": False, "verify_iat": False}
        try:
            payload = jwt.decode(token, options={**opts, "verify_signature": False})
        except jwt.DecodeError as e:
            return None
        except Exception:
            raise AuthenticationFailed()
        if 'user_id' in payload:
            user_id = payload.get('user_id')
            user = UserService.get_user_by_id(user_id)
            return user, token

        return None, token


    def get_authorization_header(self, request):
        """
        Return request's 'Authorization:' header, as a bytestring.
        Hide some test client ickyness where the header can be unicode.
        """
        auth = request.META.get("HTTP_AUTHORIZATION", b"")
        basic_token_from_qs = request.query_params.get("basic_auth_token", "")
        if not auth and basic_token_from_qs:
            auth = f"Basic {basic_token_from_qs}"
            request.META["HTTP_AUTHORIZATION"] = auth
        if isinstance(auth, str):
            # Work around django test client oddness
            auth = auth.encode(HTTP_HEADER_ENCODING)
        return auth
