from django.contrib.auth import backends, get_user_model

User = get_user_model()


class ModelBackend(backends.ModelBackend):
    def authenticate(self, request=None, **kwargs):
        try:
            from rest_framework import status

            email = kwargs.pop("email", getattr(request, "email", None))
            password = kwargs.pop("password", getattr(request, "password",""))

            user = User.objects.get(email=email)

            if user and user.check_password(password):
                return user

        except User.DoesNotExist:
            pass
