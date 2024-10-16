import socketio
from django.conf import settings

mgr = socketio.AsyncRedisManager(settings.REDIS_HOST)
sio = socketio.AsyncServer(
    async_mode="asgi", client_manager=mgr, cors_allowed_origins="*",
)

socketio_app = socketio.ASGIApp(sio)

# establishes a connection with the client
@sio.on("connect", namespace="/vehicle_count_group")
async def connect(sid, env, auth):
    print("SocketIO connect")
    if auth:
        print("SocketIO connect")
        # await sio.emit("connect", f"Connected as {sid}")
    else:
        raise ConnectionRefusedError("No auth")
