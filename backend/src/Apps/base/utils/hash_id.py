
from django.conf import settings
from hashid_field import Hashid
from hashids import Hashids

from src.Apps.base.utils.function import safe_executor


class HashIdUtils:
    HASHID_MIN_LENGTH = 7
    ALPHABET = Hashids.ALPHABET

    @staticmethod
    def hashid_to_int(
        hashid_str: str = "",
        min_length: int = HASHID_MIN_LENGTH,
        alphabet: str = ALPHABET,
        salt: str = settings.HASHID_FIELD_SALT,
    ):
        """
        To convert hashid to int id

        :param hashid_str: The str hashid
        :param min_length: The min_length to init hashid object
        :param alphabet: The alphabet to init hashid object
        :param salt: The hashid salt
        :return: int id
        """
        hash_obj = Hashid(hashid_str, salt=salt, min_length=min_length, alphabet=alphabet)
        return hash_obj.id

    @staticmethod
    def int_to_hashid(
        int_id: int = 0,
        min_length: int = HASHID_MIN_LENGTH,
        alphabet: str = ALPHABET,
        salt: str = settings.HASHID_FIELD_SALT,
    ):
        """
        To convert int id to hashid

        :param int_id: The int id
        :param min_length: The min_length to init hashid object
        :param alphabet: The alphabet to init hashid object
        :param salt: The hashid salt
        :return: str hashid
        """
        if int_id:
            hash_obj = Hashid(int_id, salt=salt, min_length=min_length, alphabet=alphabet)
            return hash_obj.hashid
        return None

    @classmethod
    @safe_executor(default="")
    def safe_int_to_hashid_str(cls, int_id: int | str) -> str:
        return int_id if isinstance(int_id, str) else str(cls.int_to_hashid(int_id))
