import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SSEConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("On connect")
        await self.channel_layer.group_add("vehicle_count_group", self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("vehicle_count_group", self.channel_name)

    async def send_event(self, event):
        print("Send event from server")
        print("Event ", event)
        await self.send(text_data=json.dumps(event))
