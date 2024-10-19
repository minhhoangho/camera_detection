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
        # print("Send event from server")
        # print("Event ", event)
        # print("Channel name ", self.channel_name)
        data = event.get("data", {})
        print("Set unique id ", data.get("unique_id"))
        connection_status[data.get("unique_id")] = self.channel_name
        await self.send(text_data=json.dumps({
            "type": "send_event",
            "data": data
        }))


    # async def receive(self, text_data):
    #     print("Receive data ", text_data)
    #     event_payload = json.loads(text_data)
    #     print("Event payload ", event_payload)
    #     if event_payload["type"] == "close_connection":
    #         data = event_payload["data"]
    #         request_id = data.get("request_id")
    #         camera_id = data.get("camera_id")
    #         unique_id = f"{request_id}_{camera_id}"
    #         # viewset = await self.channel_layer.get(unique_id)
    #         # print("View set id", id(viewset))
    #         # await viewset.disconnect(0)

