from http import HTTPStatus

import structlog
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response


def ping(request: HttpRequest) -> HttpResponse:
    """
    Return rendered default page to the approval.

    Typed with the help of ``django-stubs`` project.
    """
    return render(request, "index.html")


@api_view(['GET'])
def healthcheck(request: HttpRequest) -> Response:
    import toml
    # Load the pyproject.toml file
    with open('pyproject.toml', 'r') as f:
        pyproject_toml = toml.load(f)

    # Get the project version
    version = pyproject_toml['tool']['poetry']['version']
    desc = pyproject_toml['tool']['poetry']['description']
    repository = pyproject_toml['tool']['poetry']['repository']
    authors = pyproject_toml['tool']['poetry']['authors']
    return Response(data=dict(
        status="Success",
        version=version,
        desc=desc,
        repository=repository,
        authors=authors,
    ), status=HTTPStatus.OK)

