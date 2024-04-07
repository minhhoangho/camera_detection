

import hashlib
from collections import defaultdict as dd
from contextlib import suppress
from datetime import datetime, timedelta
from itertools import product
from typing import List, Optional, Union
from django.core.cache import cache

from django.conf import settings
from django.db import models
from django_redis import get_redis_connection
from redis import StrictRedis
from tabulate import tabulate


from src.Apps.base.models.soft_delete import SoftDeleteManager
from src.Apps.base.patterns.null import NullContext
from src.Apps.base.serializers.pickle import SignPickleSerializer as SPickle
from src.Apps.base.utils.function import safe_executor
from src.Apps.base.models.dirtyfields import CustomDirtyFieldsMixin as DirtyField


CACHE_ROOT_KEY = "APP_ROOT"

class MasterCacheHandler:
    """
    This is implement for the cache invalidation in case:
        - Centralized caching
        - Different cache version for same object
    Usage:
        - Your class should be extended from this class
        - Make sure the `get_master_key` is return the same value on different servers
        - Call `set_master_cache` when you set the cache
        - Call `delete_master_cache` when you delete the cache
    """

    @classmethod
    def get_master_key(cls, object_id: Union[str, int]) -> str:

        master_key = f"{CACHE_ROOT_KEY}:{cls.__name__}:{object_id}"
        return hashlib.sha1(master_key.encode()).hexdigest()

    @classmethod
    def get_version_keys(cls, object_id: Union[str, int]) -> set:
        master_key = cls.get_master_key(object_id)
        version_keys = cache.get(master_key) or set()
        return version_keys

    @classmethod
    @safe_executor()
    def set_master_cache(cls, object_id: Union[str, int], cache_key: str) -> None:
        master_key = cls.get_master_key(object_id)
        version_keys = cache.get(master_key) or set()
        if cache_key not in version_keys:
            version_keys.add(cache_key)
            cache.set(master_key, version_keys)

    @classmethod
    @safe_executor()
    def delete_master_cache(cls, object_id: Union[str, int]) -> None:
        master_key = cls.get_master_key(object_id)
        version_keys = cache.get(master_key) or set()
        if version_keys:
            cache.delete_many(version_keys)
            cache.delete(master_key)

    @classmethod
    @safe_executor()
    def delete_master_key(cls, object_id: Union[str, int]) -> None:
        master_key = cls.get_master_key(object_id)
        cache.delete(master_key)


class RCacheModel(models.Model, MasterCacheHandler):
    """
    Model caching use Redis with HASHES
    Usage:
       - Should be extended from Model which want to enable using redis cache
       - Using load method whenever want to get 1 object by pk to put itself into cache server
       - Cache refresh:
           + Be sure override method save and delete for SubClass in correct way
           + In case using signals (ai_api.signals) listening on post_save and post_delete -> call Model.cache_forget(pk)
           + Don't want to call cache_forget and then cache_set cache -> just cache_refresh
           + Just want to check exist from cache -> just cache_exist
       - Model changed and want to refresh all cache -> just increase cache_version
       - Cache system problem or don't want to use cached instances -> disable cache -> just cache_disabled

    Advantages:
       - Straight-forward to implement, not much work on the service class
       - Cached auto invalid when fields changed or timeout (key created by field name string)
       - Low risk of caching stale data
       - Centralize 1 place for accessing cache, and Prevent duplicated code get_cache_service everywhere
       - Allow manual reset cache model using version number
       - Allow disable cache for a particular model

    Disadvantages:
       - No support for querysets or lists (intentional, as these are notoriously difficult
           to cache and invalidate correctly).
       - Can’t use queryset update() or delete() methods.
       - Not sure when transaction failed call

    TODO:
       - Setting timeout for cached object (should be 1 day = 24 * 60 * 60) -> setting CACHE in base.py
       - Clear Cache for Bulk Update/ Bulk Delete
       - Must call manually after using querysets to update/delete
       - Enable option format field value before caching (format data when getting from db)
    """

    # Redis connection
    conn: StrictRedis = get_redis_connection(settings.MODEL_CACHE_SETTING_NAME)
    HASH_CHUNK_SIZE = settings.HASH_CHUNK_SIZE

    class Meta:
        abstract = True

    def _cache_key_value(self):
        # Note: For extras lead -> is using lead_id to create cache key
        return self.pk

    @classmethod
    def _cache_key_name(cls) -> str:
        # Note: For extras lead -> is using lead_id to create cache key
        return "pk"

    @classmethod
    def _cache_keys_name(cls) -> str:
        return "pks"

    @classmethod
    def cache_version(cls) -> str:
        # Override this into specified Model to force change cache key
        return "v1"

    @classmethod
    def cache_disabled(cls) -> bool:
        # Override this into specified Model to force disable cache if cache system has problem
        return False

    @classmethod
    def _hash_vals_holder(cls, key: str | None = None) -> str:
        class_name = cls()._meta.object_name  # noqa
        version = cls.cache_version()
        current_week = datetime.now().strftime("%Y%V")
        cache_keys = [str(CACHE_ROOT_KEY), class_name, version, current_week]
        if key and cls.HASH_CHUNK_SIZE:
            # Set the group keys for HASHES to split a big HASH to multiple small HASHES
            # To help increase the latency for accessing redis HASH (Max: HASH_CHUNK_SIZE)
            _hex = hashlib.sha256(cls._cache_key(key).encode()).hexdigest()
            hash_group = str(int(_hex, 16) % cls.HASH_CHUNK_SIZE + 1)
            cache_keys.append(hash_group)
        return ":".join(cache_keys)


    @classmethod
    def get_model_related_fields(cls) -> list:
        related_objects = cls._meta.related_objects
        related_fields = []
        for relation in related_objects:
            with suppress(Exception):
                related_fields += relation.related_model._meta.fields  # noqa
        return list(cls._meta.fields) + related_fields
    @classmethod
    def _stamp_fields(cls) -> str:
        # Returns serialized description of model fields.
        field_names = [f.name for f in cls.get_model_related_fields()]
        str_field = ",".join(field_names)
        str_field = hashlib.sha1(str_field.encode()).hexdigest()
        return str_field

    @classmethod
    def _cache_key(cls, key: str, language: str | None = None) -> str:
        """
        Cache key rule:
            class_name changed -> new object
            str_field changed (fields changed) -> new object
            key (id) changed -> new object
            version change -> new object
        :param key:
        :param language:
        :return:
        """
        key_str = str(key)
        stamp = cls._stamp_fields()
        if stamp in key_str:
            return key_str
        cache_keys = [stamp, key_str]

        # To support get tranlated object from current language context
        # context language change -> new object
        ctx_language = cls._get_context_lang(language)
        if ctx_language:
            cache_keys.append(ctx_language)
        return "_".join(cache_keys)





    @classmethod
    @safe_executor()
    def cache_get(cls, key: str, language: str | None = None):
        _key, obj = cls._cache_key(key, language=language), None
        obj_bytes = cls.conn.hget(cls._hash_vals_holder(_key), _key)
        if obj_bytes:
            obj = SPickle.loads(obj_bytes)
            obj.after_get_cache()
        return obj

    @classmethod
    @safe_executor()
    def _cache_get_multi(cls, keys: List[str]) -> List:
        _keys, obj_list = [cls._cache_key(key) for key in keys], []
        hash_key_map = [(cls._hash_vals_holder(k), k) for k in _keys]
        with cls.conn.pipeline() as pipe:
            [pipe.hget(_hash, _key) for _hash, _key in hash_key_map]
            obj_bytes = pipe.execute()
        for obj_byte in obj_bytes:
            obj = obj_byte and SPickle.loads(obj_byte)
            if obj:
                obj.after_get_cache()
            obj_list.append(obj)
        return obj_list

    @classmethod
    def cache_exist(cls, key: str) -> bool:
        key_field = cls._cache_key(key)
        hash_group_vals = cls._hash_vals_holder(key_field)
        return cls.conn.hexists(hash_group_vals, key_field)

    @classmethod
    def _set_expire(cls, hash_keys: List[str]):
        # Expire at monday(1st day) next week from the current time.
        for k in hash_keys:
            if cls.conn.ttl(k) > 0:
                continue
            now = datetime.now()
            expire_at = now + timedelta(days=(7 - now.weekday()))
            cls.conn.expireat(k, expire_at)

    @classmethod
    @safe_executor()
    def _cache_set(cls, key: str, obj: any, language: str | None = None):
        cache_key = cls._cache_key(key, language=language)
        hash_group_vals = cls._hash_vals_holder(cache_key)
        if cls.conn.hset(hash_group_vals, cache_key, SPickle.dumps(obj)):
            cls._set_expire([hash_group_vals])

    @classmethod
    def cache_set(cls, key: str, obj: any, language: str | None = None):
        # Fast stop if cache is disabled
        if cls.cache_disabled() or not (obj and key):
            return

        with obj.before_set_cache():
            cls._cache_set(key, obj, language=language)

    @classmethod
    @safe_executor()
    def _cache_set_multi(cls, objects):
        hash_key_map = dd(dict)
        for obj in objects:
            cache_key = cls._cache_key(getattr(obj, cls._cache_key_name(), None))
            if cache_key:
                hash_group_vals = cls._hash_vals_holder(cache_key)
                hash_key_map[hash_group_vals].update({cache_key: SPickle.dumps(obj)})
        if not hash_key_map:
            return
        with cls.conn.pipeline() as pipe:
            for _hash, _mapping in hash_key_map.items():
                pipe.hset(_hash, mapping=_mapping)
            pipe.execute(raise_on_error=False)
        cls._set_expire(hash_key_map.keys())

    @classmethod
    def set_multi(cls, obj_list: List):
        # Fast stop if cache is disabled
        if cls.cache_disabled() or not obj_list:
            return

        DirtyField.purge_initial_states(obj_list)
        cls._cache_set_multi(obj_list)

    @classmethod
    def cache_forget(cls, key: str):
        # Fast stop if cache is disabled
        if cls.cache_disabled() or not key:
            return
        cache_key = cls._cache_key(key)
        cls.conn.hdel(cls._hash_vals_holder(cache_key), cache_key)

    @classmethod
    def cache_forget_many(cls, keys: List[str]):
        # Fast stop if cache is disabled
        if cls.cache_disabled() or not keys:
            return

        hash_key_map = dd(list)
        forget_langs = cls._get_setting_langs()
        for k, lang in product(keys, forget_langs):
            cache_key = cls._cache_key(k, language=lang)
            hash_key_map[cls._hash_vals_holder(cache_key)].append(cache_key)

        with cls.conn.pipeline() as pipe:
            [pipe.hdel(_hash, *_keys) for _hash, _keys in hash_key_map.items()]
            pipe.execute()

    @classmethod
    def _get_setting_langs(cls) -> List:
        return [None] if cls._is_self_handled_translation_model() else dict(settings.LANGUAGES).keys()

    @classmethod
    def cache_forget_by_filter(cls, **params):
        """
        Cache forget by filter
        Only work when _cache_key_name is field of model
        :param params: filter query
        :type params: dict
        :return: None
        :rtype: None
        """
        keys = cls.objects.filter(**params).values_list(cls._cache_key_name(), flat=True)[::1]
        cls.cache_forget_many(keys)

    @classmethod
    def cache_forget_by_conditions(cls, conditions: dict):
        # conditions is instance of Q
        # from django.db.models import Q
        keys = cls.objects.filter(conditions).values_list(cls._cache_key_name(), flat=True)[::1]
        cls.cache_forget_many(keys)

    @classmethod
    def cache_forget_objs(cls, objs):
        if objs:
            if isinstance(objs, cls):
                objs = [objs]
            cls.cache_forget_many([obj._cache_key_value() for obj in objs])

    @classmethod
    def load_multiple(cls, **kwargs):
        """
        using
        :param cls: instance
        :param kwargs:
            pks: ids
        """
        kwargs = dict(kwargs)
        keys = kwargs.get(cls._cache_keys_name(), [])

        obj_list = cls._cache_get_multi(keys) or []
        result = dict(zip(keys, obj_list))
        missing_keys = [key for key, value in result.items() if not value]
        if missing_keys:
            missing_objects = cls.objects.filter(pk__in=missing_keys)
            for obj in missing_objects:
                result[obj.pk] = obj
            cls.set_multi(missing_objects)
        return result

    @classmethod
    def load(cls, **kwargs):
        """
        using
        :param cls: instance
        :param kwargs:
            pk: id
            safe_mode: return new object if True or raise exception ObjectDoesNotExist/DoesNotExist if False
            force_reload: True -> force get from db, False -> get from cache first
            custom_ft: Is a dict to filter recruiter
        """

        kwargs = dict(kwargs)
        safe_mode = kwargs.pop("safe_mode", False)
        force_reload = kwargs.pop("force_reload", None) or cls.cache_disabled()
        include_deleted = kwargs.pop("include_deleted", False)
        custom_ft = kwargs.pop("custom_ft", {})
        ignore_error = kwargs.get("ignore_error", False)
        order_by = kwargs.get("order_by", [])

        key = kwargs.get(cls._cache_key_name(), 0)
        obj = None if force_reload else cls.cache_get(key)
        if not obj:
            # Get from RDS and safe created new object
            ft_kwargs = {}
            for field, val in kwargs.items():
                if "__" in field:
                    raise AttributeError(f"Does not support reference object cache key: {field}.")
                if hasattr(cls, field):
                    ft_kwargs.update({field: val})
            if custom_ft:
                ft_kwargs.update(custom_ft)
            created = False
            if safe_mode:
                obj, created = cls.objects.get_or_create(**ft_kwargs)
            elif ignore_error:
                obj = cls.objects.filter(**ft_kwargs)

                if order_by:
                    obj = obj.order_by(*order_by)
                obj = obj.first()
            elif include_deleted and isinstance(cls.objects, SoftDeleteManager):
                obj = cls.objects.include_deleted().get(**ft_kwargs)
            else:
                obj = cls.objects.get(**ft_kwargs)
            if not created and obj:
                # Do not cache the new object during safe_mode
                cls.cache_set(key, obj)

        exclude_deleted = not include_deleted and getattr(obj, "is_deleted", False)
        return None if exclude_deleted else obj

    def pre_save(self, kwargs):
        """
        Pre save
        - Do something before saving
        - Pass kwargs as value to be able to override update_fields
        :param kwargs:
        :return:
        """
        pass

    def save(self, *args, **kwargs):
        self.pre_save(kwargs)
        # should be save to db first
        super().save(*args, **kwargs)
        # Forget cache after save to db
        self.cache_forget(self._cache_key_value())

    def delete(self, *args, **kwargs):
        # Remove cached before delete from db
        self.cache_forget(self._cache_key_value())
        super().delete()

    def before_set_cache(self):
        if issubclass(self.__class__, DirtyField):
            return DirtyField.before_set_cache(self)
        return NullContext()

    def after_get_cache(self):
        if issubclass(self.__class__, DirtyField):
            return DirtyField.after_get_cache(self)
        return NullContext()

    @classmethod
    def cache_usage(cls, print_only=True):
        obj = cls()

        def _info(group_key):
            used = int(obj.conn.hlen(group_key))
            ttl = str(timedelta(seconds=max(obj.conn.ttl(group_key), 0)))
            msize = obj.conn.memory_usage(group_key)
            msize = msize / (1024 * 1024) if msize else 0
            if used:
                return used, msize, [cls.__name__, f"{used:,.2f}", f"{msize:,.3f}", ttl, group_key]
            return 0, 0, []

        if cls.HASH_CHUNK_SIZE:
            _data, total_used, total_msize = [], 0, 0
            for i in range(cls.HASH_CHUNK_SIZE):
                hash_group_key = f"{obj._hash_vals_holder()}:{i+1}"
                used, msize, data = _info(hash_group_key)
                if used:
                    total_used += used
                    total_msize += total_msize
                    _data.append(data)
        else:
            total_used, total_msize, _data = _info(obj._hash_vals_holder())
            if total_used:
                _data = [_data]
        if print_only:
            return obj._tbl_output(_data, fmt="simple")
        return _data, total_used, total_msize

    @classmethod
    def print_all_usage(cls):
        from rich.progress import track

        cache_infos = []
        subclasses = RCacheModel.__subclasses__()
        if subclasses:
            used_total, msize_total = 0, 0
            for sub in track(subclasses):
                usage_data = sub.cache_usage(print_only=False)
                if not usage_data:
                    continue
                _data, used, msize = usage_data
                used_total += used
                msize_total += msize
                cache_infos += _data
            cache_infos.append(["*" * 20])
            cache_infos.append(["Summary", f"{used_total:,.2f}", f"{msize_total:,.2f}", "-", "-"])
        cls._tbl_output(cache_infos)

    @staticmethod
    def _tbl_output(data, fmt="rst"):
        headers = ["Model", "Used (keys)", "Size (Mb)", "TTL", "CacheKey"]
        colalign = ("right", "right", "right", "right")
        print(tabulate(data, headers=headers, tablefmt=fmt, showindex=True, colalign=colalign))
