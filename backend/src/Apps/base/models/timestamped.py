

from django.db import models
from django.utils import timezone

from src.Apps.base.models.custom_data_types import SimpleDateTimeField


class TimeStampedModel(models.Model):
    # Use this model when you want to handle the timestamp common fields by your-self
    # Actually, should use AutoTimeStampedModel for these common fields
    # and use other fields for handle your business logic
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        abstract = True


class AutoTimeStampedModel(models.Model):
    # https://docs.djangoproject.com/en/dev/ref/models/fields/#django.db.models.DateField.auto_now
    # Automatically set the field to now. you can not override.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SimpleTimeStampedModel(models.Model):
    created_at = SimpleDateTimeField(default=timezone.now)
    updated_at = SimpleDateTimeField(auto_now=True)

    class Meta:
        abstract = True
