import os
from django.core.management.base import BaseCommand
from django.conf import settings
import numpy as np
import json
import requests
import cv2

import requests
from PIL import Image
from io import BytesIO

from src.Apps.gis_map.models import GisViewPointCamera, GisViewPoint


class Command(BaseCommand):
    help = 'Run capture location and save file: ./manage.py capture_location'

    def handle(self, *args, **kwargs):
        # Example usage
        API_KEY = "c03ef2b9bca04d8ba477409f929517f9"  # Replace with your Geoapify API key
        cam_id = 11

        camera_viewpoint = GisViewPointCamera.objects.get(id=cam_id)
        view_point = GisViewPoint.objects.get(id=camera_viewpoint.view_point_id)
        lat = view_point.lat
        long = view_point.long
        img_name = f"{view_point.name}_{cam_id}.png"
        self.capture_map_image(API_KEY, (lat, long), img_name=img_name)  # Coordinates for New York City

    def capture_map_image(self, api_key, location, zoom=20, width=800, height=300, style="osm-carto",
                          img_name="geoapify_map_image.png"):
        # Construct the URL for the Geoapify static map
        base_url = "https://api.geoapify.com/v1/staticmap?"
        center_move_left_abit = location[1] - 0.0003
        center_move_down_abit = location[0] - 0.00008
        print(center_move_left_abit, center_move_down_abit)
        # How to get lat long of corners of the image
        mark_point = (location[0], center_move_left_abit)

        params = {
            "center": f"lonlat:{center_move_left_abit},{center_move_down_abit}",
            "zoom": zoom,
            "width": width,
            "height": height,
            "style": style,
            "apiKey": api_key
        }

        # Make the request
        response = requests.get(base_url, params=params)

        if response.status_code == 200:
            # Open the image
            img = Image.open(BytesIO(response.content))
            img.save(img_name)  # Save the image
            print("Map image saved as 'geoapify_map_image.png'")
        else:
            print(f"Error: {response.status_code} - {response.text}")
