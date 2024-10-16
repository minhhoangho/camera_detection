
from src.Apps.websocket import socket
from django.urls import include, path
# from . import consumers

websocket_urlpatterns = [
    # re_path(r'ws/$', consumers.SSEConsumer.as_asgi()),
    path(r'^socket.io/', socket.socketio_app)
]
