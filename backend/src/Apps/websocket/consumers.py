import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer, AsyncWebsocketConsumer


class SocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # async_to_sync(self.channel_layer.group_add)("vehicle_count_group", self.channel_name)
        # print("Connected ", self.channel_name)
        await self.channel_layer.group_add("vehicle_count_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("vehicle_count_group", self.channel_name)
        await self.disconnect(0)

    async def send_event(self, event):
        print("Send event from server")
        print("Event ", event)
        await self.send(text_data=json.dumps(event))
