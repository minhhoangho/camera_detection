from django.db import models


class TrafficData(models.Model):
    view_point_id = models.PositiveIntegerField(null=False)
    total_vehicle_count = models.IntegerField(null=False)
    avg_speed = models.FloatField(null=True)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "traffic_data"
