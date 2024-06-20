from src.Apps.base.utils.type_utils import TypeUtils
from src.Apps.system.models import TrafficData, TrafficDataVehicle


class TrafficAnalyticService:
    @classmethod
    async def asave_traffic_data(cls, data: dict):
        view_point_id = TypeUtils.safe_int(data.get('view_point_id'))
        total_vehicle_count = TypeUtils.safe_int(data.get('total_vehicle_count'))
        avg_speed = TypeUtils.safe_float(data.get('avg_speed'))
        timestamp = data.get('timestamp')

        vehicle_data = data.pop('vehicle_data', [])
        traffic_data = TrafficData.objects.create(view_point_id=view_point_id, total_vehicle_count=total_vehicle_count,
                                                  avg_speed=avg_speed, timestamp=timestamp)
        for vehicle in vehicle_data:
            vehicle_count = TypeUtils.safe_int(vehicle.get('vehicle_count'))
            vehicle_type = TypeUtils.safe_int(vehicle.get('vehicle_type'))

            TrafficDataVehicle.objects.create(traffic_data_id=traffic_data.id, vehicle_count=vehicle_count,
                                              vehicle_type=vehicle_type)
        return True

