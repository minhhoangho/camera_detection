import firebase_admin
from firebase_admin import credentials

from src.settings.components import BASE_DIR

service_account_file = BASE_DIR.joinpath("src", "settings", "serviceAccountKey.json")
# cred_object = firebase_admin.credentials.Certificate()
# default_app = firebase_admin.initialize_app(cred_object, {
#     'databaseURL':databaseURL
#     })

cred = credentials.Certificate(service_account_file)
firebase_admin.initialize_app(cred)


