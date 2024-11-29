
try:
    from firebase_admin import firestore

    store = firestore.client()
except Exception as e:
    print("Error connecting to Firestore: ")


class Firestore:
    @classmethod
    def get_all(cls, collection: str):
        return store.collection(collection).get()

    @classmethod
    def save_data(cls, collection: str, data: dict):
        store.collection(collection).add(data)
        return True

    @classmethod
    def get_collection(cls, collection: str):
        return store.collection(collection)
