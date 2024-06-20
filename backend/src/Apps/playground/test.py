from typing import Union, List
import django

import threading
import os
import sys
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")
from django.conf import settings

if __name__ == "__main__":
    django.setup()

    print("Hello World!")
    print("Django Settings: ", settings)
