from os import environ
from os import path as ospath
from os import system as ossyscall
from sys import argv
from sys import path as syspath

import django
from django.conf import settings
from django.core.management import call_command

PROJECT_ROOT = ospath.dirname(ospath.abspath(__file__)) + "/../"
MANAGE_PY = f"{PROJECT_ROOT}/manage.py"


def noop(*args, **kwargs):  # noqa
    pass  # noqa


def boot_django():
    """Boot Django."""
    syspath.append(PROJECT_ROOT)
    environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")
    django.setup()


def __getattr__(cmd):
    args = argv[1:]
    boot_django()
    if cmd.endswith("server"):
        if not any(":" in arg for arg in args):
            api_port = getattr(settings, "API_PORT", "8000")
            args.append(f"0.0.0.0:{api_port}")
        ossyscall(f"python {MANAGE_PY} {cmd} {' '.join(args)}")  # noqa: S605
    else:
        call_command(cmd, args)
    return noop
