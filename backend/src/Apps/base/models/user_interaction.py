from django.db import models

class UserInteractionModel(models.Model):
    created_by = models.PositiveIntegerField(default=0)
    updated_by = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True
