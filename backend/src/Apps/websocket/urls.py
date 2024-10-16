from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'socket.io/$', consumers.SSEConsumer.as_asgi()),
]
