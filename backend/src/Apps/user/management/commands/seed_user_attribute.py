from typing import List

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from faker import Faker
import os
import csv

from src.Apps.user.models import UserAttributeKey


class Command(BaseCommand):
    help = "Seed user attribute key"

    def handle(self, *args, **options):
        exist = UserAttributeKey.objects.exist()
        if not exist:
            data = self.init_data()
            UserAttributeKey.objects.bulk_create(data)

    def init_data(self) -> List:
        return [
            {
                "label": "Date of Birth",
                "key_name": "date_of_birth",
                "description": "User's date of birth",
                "is_default": True,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 3
            },
            {
                "label": "Country",
                "key_name": "country",
                "description": "User's country of residence",
                "is_default": True,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Phone Number",
                "key_name": "phone_number",
                "description": "User's phone number",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Gender",
                "key_name": "gender",
                "description": "User's gender",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 2
            },
            {
                "label": "Occupation",
                "key_name": "occupation",
                "description": "User's occupation",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Language",
                "key_name": "language",
                "description": "User's preferred language",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Address",
                "key_name": "address",
                "description": "User's mailing address",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Education Level",
                "key_name": "education_level",
                "description": "User's highest education level",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Favorite Color",
                "key_name": "favorite_color",
                "description": "User's favorite color",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Interests",
                "key_name": "interests",
                "description": "User's interests and hobbies",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            },
            {
                "label": "Employment Status",
                "key_name": "employment_status",
                "description": "User's current employment status",
                "is_default": False,
                "category": 1,
                "status": 1,
                "privacy_setting": 0,
                "attribute_data_type": 1
            }
        ]
