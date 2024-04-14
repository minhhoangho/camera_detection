# Authentication Settings
# AUTH_USER_MODEL = "authtools.User"
# 'authtools.User'

# AUTHENTICATION_BACKENDS = (
#     "axes.backends.AxesBackend",
#     "django.contrib.auth.backends.ModelBackend",
# )
AUTHENTICATION_BACKENDS = [
    "src.Apps.auth.services.auth.ModelBackend",
    # For default login
    # 'django.contrib.auth.backends.ModelBackend' #For login by email, reset pasword
]
