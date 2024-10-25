from src.Apps.gis_map.serializers.gis_map import ViewPointSerializer
from src.Apps.gis_map.services.gis_map import GisMapService
from src.Apps.utils.firebase_client.firestore import Firestore
from datetime import datetime, timedelta


class AnalyticService:
    @classmethod
    def analytic_by_location(cls, view_point_id):
        collection = Firestore.get_collection("analytic")
        now = datetime.utcnow()
        start_time = now - timedelta(minutes=3)
        end_time = now + timedelta(minutes=3)

        end_time =  end_time.timestamp()
        start_time = start_time.timestamp()

        query = collection.where("view_point_id", "==", view_point_id) \
            .where("timestamp", ">=", start_time) \
            .where("timestamp", "<=", end_time)
        docs = query.get()
        res = {}
        for doc in docs:
            object_count_map = doc.to_dict().get("object_count_map", {})
            for key, value in object_count_map.items():
                if key in res:
                    res[key] += value
                else:
                    res[key] = value
        return res


    @classmethod
    def analytic_all_location(cls):
        view_points = GisMapService.all_view_points()
        res = []
        for view_point in view_points:
            data = cls.analytic_by_location(view_point.id)
            res.append({
                "view_point": ViewPointSerializer(view_point).data,
                "data": data
            })

        return res
