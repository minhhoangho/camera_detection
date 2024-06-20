from django.db import models


class TrafficDataVehicle(models.Model):
    traffic_data_id = models.PositiveIntegerField(null=False)
    vehicle_count = models.IntegerField(null=False)
    vehicle_type = models.IntegerField(null=False)

    class Meta:
        db_table = "traffic_data_vehicles"
