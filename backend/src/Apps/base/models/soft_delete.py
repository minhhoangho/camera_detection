from django.db import models
from django.utils import timezone

from src.Apps.base.models.manager import BaseManager
from src.Apps.base.models.queryset import BaseQuerySet
from src.Apps.base.utils.main import Utils


def set_delete_attributes(obj, deleted_by):
    obj.is_deleted = True
    obj.deleted_at = timezone.now()
    obj.deleted_by = deleted_by
    update_is_active = isinstance(getattr(obj, "is_active", None), bool)
    if update_is_active:
        obj.is_active = False
    return obj, update_is_active


class SoftDeleteQuerySet(BaseQuerySet):
    def delete(self, trigger_signal: bool = False):
        from src.Apps.auth.use_global import get_current_user

        deleted_by = Utils.safe_int(getattr(get_current_user(), "id", 0))
        update_fields = ["is_deleted", "deleted_by", "deleted_at"]
        update_is_active = False
        for obj in self:
            obj, update_is_active = set_delete_attributes(obj, deleted_by=deleted_by)
        if update_is_active:
            update_fields.append("is_active")

        self.bulk_update(self, fields=update_fields, batch_size=100)


class SoftDeleteManager(BaseManager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)

    def include_deleted(self):
        return SoftDeleteQuerySet(self.model, using=self._db)


class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(default=None, null=True)
    deleted_by = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True

    def delete(self, request_user_id=0):
        obj, _ = set_delete_attributes(self, deleted_by=request_user_id)
        obj.save()

    objects = SoftDeleteManager()
