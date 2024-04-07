from src.Apps import _thread_global


def get_current_request():
    return getattr(_thread_global, "request", None)


def get_current_user():
    request = get_current_request()
    if request:
        return getattr(request, "user", None)
