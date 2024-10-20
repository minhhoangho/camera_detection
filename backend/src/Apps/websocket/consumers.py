import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer, AsyncWebsocketConsumer
from src.Apps.websocket.shared_state import connection_status


class SocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # async_to_sync(self.channel_layer.group_add)("vehicle_count_group", self.channel_name)
        print("Connected ", self.channel_name)
        await self.channel_layer.group_add("vehicle_count_group", self.channel_name)
        await self.accept()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("vehicle_count_group", self.channel_name)
        for key, value in connection_status.items():
            if value == self.channel_name:
                connection_status[key] = False


    async def send_event(self, event):
        data = event.get("data", {})
        print("Set unique id ", data.get("unique_id"))
        connection_status[data.get("unique_id")] = self.channel_name
        await self.send(text_data=json.dumps({
            "type": "send_event",
            "data": data
        }))


