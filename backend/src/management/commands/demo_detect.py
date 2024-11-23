import os
from django.core.management.base import BaseCommand
from django.conf import settings
import numpy as np
import json
import requests
import cv2
from src.Apps.detector.services.detection_util import Yolov8Detector
from src.Apps.detector.services.detector_service import DetectorService
from src.Apps.gis_map.dataclass.bev_metadata import Coordinate
from src.Apps.gis_map.models import GisViewPointCamera, GisViewPoint

detector = Yolov8Detector(os.path.join(settings.BASE_DIR, "../models", "yolov8s.pt"))

class Command(BaseCommand):
    help = 'Run demo detect and save file'


    def handle(self, *args, **kwargs):
        cam_id= 11

        camera_viewpoint = GisViewPointCamera.objects.get(id=cam_id)
        view_point = GisViewPoint.objects.get(id=camera_viewpoint.view_point_id)

        homography_matrix = camera_viewpoint.homography_matrix
        mapping_bev = False
        bev_image = None
        if homography_matrix:
            mapping_bev = True
            homography_matrix = json.loads(homography_matrix)
            homography_matrix = np.array(homography_matrix)
        if camera_viewpoint.bev_image:
            response = requests.get(camera_viewpoint.bev_image)
            img_array = np.array(bytearray(response.content), dtype=np.uint8)
            bev_image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        else:
            mapping_bev = False

        demo_frame = requests.get(view_point.thumbnail)
        frame = np.array(bytearray(demo_frame.content), dtype=np.uint8)
        frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)

        frame, results = detector.get_prediction_and_bev_image(frame=frame, bev_image=bev_image,
                                                               homography_matrix=homography_matrix)
        bev_meta = camera_viewpoint.bev_image_metadata
        bev_meta = json.loads(bev_meta)
        vehicle_points = DetectorService.generate_point_vehicles(bev_meta, homography_matrix, results)
        list_lat_long = [
            (point['lat'], point['long']) for point in vehicle_points
        ]
        image_coordinates = bev_meta.get("image_coordinates", {})
        top_left: Coordinate = Coordinate(**image_coordinates.get("top_left", {}))
        top_right: Coordinate = Coordinate(**image_coordinates.get("top_right", {}))
        bottom_left: Coordinate = Coordinate(**image_coordinates.get("bottom_left", {}))
        bottom_right: Coordinate = Coordinate(**image_coordinates.get("bottom_right", {}))
        rec = [
            (top_left.lat, top_left.long),
            (top_right.lat, top_right.long),
            (bottom_right.lat, bottom_right.long),
            (bottom_left.lat, bottom_left.long)
        ]
        # Save frame
        cv2.imwrite('frame.jpg', frame)
        self.save_map(list_lat_long, rec)



        # vehicle_points = DetectorService.generate_point_vehicles(bev_meta, homography_matrix, results)
        # await self.send_points(
        #     channel_layer=channel_layer,
        #     points=vehicle_points,
        #     camera_id=cam_id,
        #     camera_uri=video_url,
        #     view_point_id=view_point.id,
        #     timestamp=int(time.time()),
        #     unique_id=unique_id
        # )


    def save_map(self, locations: list[tuple], rectangle: list[tuple]):
        import folium

        # # Define the location coordinates (latitude, longitude)
        # location = [51.5074, -0.1278]  # Example: London
        location = locations[0]

        # Create a map object
        mymap = folium.Map(location=location, zoom_start=12)

        # draw rectangle in map
        folium.Polygon(rectangle, color='blue', fill=True, fill_color='blue', fill_opacity=0.2).add_to(mymap)




        for location in locations:
            # add mark point
            folium.CircleMarker(location, radius=5, fill=True, color='red').add_to(mymap)
            # Add a marker
            # folium.Marker(location, popup='London').add_to(mymap)

        # Save the map to an HTML file
        mymap.save('map.html')


