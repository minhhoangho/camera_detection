import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SSEConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def send_event(self, event):
        print("Send event from server")
        await self.send(text_data=json.dumps(event))
