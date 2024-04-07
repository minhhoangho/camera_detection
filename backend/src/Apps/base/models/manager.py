
from typing import Any, Type, TypeVar

from django.db.models import Manager, Model

from src.Apps.base.models.queryset import BaseQuerySet

M = TypeVar("M", bound=Model)

class BaseManager(Manager):
    def get_queryset(self):
        return BaseQuerySet(self.model, using=self._db)

    def translate(self, *args, **kwargs):
        return self
