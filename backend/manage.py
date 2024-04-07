#!/usr/bin/env python

import os
import sys


def main() -> None:
    """Run main function.

    It does several things:
        1. Sets default settings module, if it is not set
        2. Warns if Django is not installed
        3. Executes any given command

    :raises:
        ImportError: Import Error Exception
    """
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")
    try:
        from django.core import management  # noqa: WPS433
    except ImportError as exc:
        raise ImportError(
            """
            Couldn't import Django. Are you sure it's installed and
            available on your PYTHONPATH environment variable? Did you
            forget to activate a virtual environment?
            """,
        ) from exc
    management.execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
