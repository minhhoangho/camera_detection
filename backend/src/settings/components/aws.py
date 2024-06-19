from src.settings.components import config


AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID", default="")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY", default="")

AWS_S3_PUBLIC_BUCKET = config("AWS_S3_PUBLIC_BUCKET", default="app-public-bucket")

