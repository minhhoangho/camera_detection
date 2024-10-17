from django.urls import path, re_path
from src.Apps.websocket.consumers import SocketConsumer

websocket_urlpatterns = [
    # path('wws/', SocketConsumer.as_asgi(), name="SocketConsumer"),
    re_path(r'ws/$', SocketConsumer.as_asgi()),
]
