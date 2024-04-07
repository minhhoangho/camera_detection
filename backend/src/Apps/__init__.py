try:
    from threading import local

except ImportError:
    # noinspection PyUnresolvedReferences
    from django.utils._threading_local import local

_thread_global = local()
