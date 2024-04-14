from django.contrib.auth import get_user_model
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class GisMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
