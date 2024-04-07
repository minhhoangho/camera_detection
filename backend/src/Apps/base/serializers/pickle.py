from typing import Any

from django.contrib.sessions.serializers import PickleSerializer
from django.core.signing import TimestampSigner


class OPickleSerializer(PickleSerializer):
    def __init__(self, protocol=4):
        # Change protocol to 4 for matching with latest protol from python3.6
        super().__init__(protocol)


class SignPickleSerializer:
    ENCODING = "utf-8"

    @classmethod
    def _signing(cls, key=None, salt="django.core.signing"):
        # Legacy algorithm
        algorithm = "sha1"
        return TimestampSigner(key, salt=salt, algorithm=algorithm)

    @classmethod
    def dumps(cls, value: Any) -> bytes:
        signed = cls._signing().sign_object(value, serializer=OPickleSerializer, compress=True)
        return bytes(signed, cls.ENCODING)

    @classmethod
    def loads(cls, value: bytes) -> Any:
        return cls._signing().unsign_object(value.decode(cls.ENCODING), serializer=OPickleSerializer)
