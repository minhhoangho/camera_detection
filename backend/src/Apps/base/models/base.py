import contextlib
import uuid
from dirtyfields import DirtyFieldsMixin
from django.db import models

from hashid_field import Hashid, HashidAutoField

from src.Apps.base.models.manager import BaseManager
from src.Apps.base.models.soft_delete import SoftDeleteModel
from src.Apps.base.models.timestamped import SimpleTimeStampedModel, AutoTimeStampedModel, TimeStampedModel
from src.Apps.base.utils.hash_id import HashIdUtils


class UUIDModel(models.Model, DirtyFieldsMixin):
    uuid = models.UUIDField(db_index=True, default=uuid.uuid4, null=True)
    objects = BaseManager()

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        from src.Apps.base.utils.sql import SQLUtils

        if not self.pk:
            self.uuid = uuid.uuid4()
        else:
            # check insert or update when pk existed
            # get value of pk before checking
            pk_value = self.pk
            if isinstance(self.pk, Hashid):
                pk_value = HashIdUtils.hashid_to_int(self.pk)
            elif isinstance(self.pk, str):
                pk_value = f"'{self.pk}'"
            # check existing record
            raw_sql = f"SELECT uuid FROM {self._meta.db_table} WHERE {self._meta.pk.column} = {pk_value}"
            if not SQLUtils.do_raw_query(raw_sql):
                # in case of inserting new record -> generate uuid
                # if uuid is string, try to convert to uuid
                if isinstance(self.uuid, str):
                    with contextlib.suppress(Exception):
                        self.uuid = uuid.UUID(self.uuid)
                # if uuid is not valid, generate new uuid
                if not isinstance(self.uuid, uuid.UUID):
                    self.uuid = uuid.uuid4()
                # check duplicated and re-generate
                while 1:
                    uuid_sql = f"SELECT uuid FROM {self._meta.db_table} WHERE uuid = '{self.uuid.hex}'"
                    if not SQLUtils.do_raw_query(uuid_sql):
                        break
                    self.uuid = uuid.uuid4()
            else:
                # in case of updating old record -> don't allow modify uuid
                with contextlib.suppress(Exception):
                    dirtyfields = self.get_dirty_fields(check_relationship=True)
                    dirtyfields.pop("uuid", None)
                    update_fields = kwargs.get("update_fields", list(dirtyfields.keys()))
                    with contextlib.suppress(Exception):
                        update_fields.remove("uuid")
                    with contextlib.suppress(Exception):
                        self._meta.get_field("updated_at")
                        update_fields.append("updated_at")
                    # if Pk is in update_fields -> this object is not updated -> keep default save()
                    if update_fields and self._meta.pk.name not in update_fields:
                        kwargs["update_fields"] = update_fields
                # if old uuid is not yet generated
                if not self.uuid:
                    self.uuid = uuid.uuid4()

        return super().save(*args, **kwargs)

    @classmethod
    def get_by_uuid(cls, uuid=None):
        return cls.objects.get(uuid=uuid)


class UUIDTimeStampedModel(TimeStampedModel, UUIDModel):
    class Meta:
        abstract = True


class UUIDAutoTimeStampedModel(AutoTimeStampedModel, UUIDModel):
    class Meta:
        abstract = True


class UUIDSimpleTimeStampedModel(SimpleTimeStampedModel, UUIDModel):
    class Meta:
        abstract = True


class UUIDSoftDeleteModel(SoftDeleteModel, UUIDModel):
    class Meta:
        abstract = True


class HashidAutoModel(models.Model):
    id = HashidAutoField(primary_key=True)

    class Meta:
        abstract = True


class TrackingModelMixin(models.Model):
    TRACKED_FIELDS = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._changed_fields = {}

    def __setattr__(self, name, value):
        if hasattr(self, "_changed_fields") and name in self.TRACKED_FIELDS:
            if name not in self._changed_fields or getattr(self, name) != value:
                self._changed_fields[name] = getattr(self, name)
        super().__setattr__(name, value)

    def changed(self):
        """
        Returns a dictionary containing the original values of the changed fields.
        """
        return self._changed_fields

    class Meta:
        abstract = True
