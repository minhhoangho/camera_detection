from src.Apps.utils.firebase_client.firestore import Firestore
from datetime import datetime, timedelta


class AnalyticService:

    @classmethod
    def analytic_by_location(cls, view_point_id):
        collection = Firestore.get_collection("analytic")
        now = datetime.utcnow()
        start_time = now - timedelta(minutes=5)
        end_time = now + timedelta(minutes=5)

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


