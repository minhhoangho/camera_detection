from src.settings.components import config

JWT_TOKEN_EXPIRED_TIME = 60 * 60 * 24 * 7  # 7 days
JWT_SECRET = config("JWT_SECRET", "secret")
JWT_ALGORITHM = "HS256"

