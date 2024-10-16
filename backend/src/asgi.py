"""
ASGI config for src project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import URLRouter, ProtocolTypeRouter
from django.core.asgi import get_asgi_application
from src.Apps.websocket.urls import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")

django_asgi_app = get_asgi_application()

# # its important to make all other imports below this comment
# import socketio
# from Apps.websocket.socket import sio
#
# application = socketio.ASGIApp(sio, django_asgi_app)


application = ProtocolTypeRouter({
    "http": django_asgi_app,
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
