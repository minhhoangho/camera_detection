from http import HTTPStatus

import structlog
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def ping(request: HttpRequest) -> HttpResponse:
    """
    Return rendered default page to the approval.

    Typed with the help of ``django-stubs`` project.
    """
    return render(request, "index.html")


def log(request: HttpRequest) -> HttpResponse:
    """
    Return rendered default page to the approval.

    Typed with the help of ``django-stubs`` project.
    """
    logger = structlog.get_logger(__name__)
    try:
        logger.bind(ip="127.0.0.1", message="Nevermind, I'm testing the logger!!!")
        logger.debug("debug message", bar="Buz")
        logger.info("info message", bar="Buz")
        logger.warning("warning message", bar="Buz")
        logger.error("error message", bar="Buz")
        logger.critical("critical message", bar="Buz")
        print(1 / 0)  # noqa
    except Exception:
        logger.exception("Catched an exception")
    return HttpResponse(status=HTTPStatus.OK)


def sentry_debug(request: HttpRequest) -> HttpResponse:
    #  Check Sentry setting
    print(1 / 0) # noqa
    return HttpResponse(status=200)
