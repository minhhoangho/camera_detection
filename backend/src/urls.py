"""src URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))

Main URL mapping configuration file.
Include other URLConfs from external apps using method `include()`.
It is also a good practice to keep a single URL to the root index page.
This examples uses Django's default media
files serving technique in development.
"""

from django.conf import settings
from django.urls import include, path
from django.views.generic import TemplateView
from health_check import urls as health_urls


urlpatterns = [
    # Health checks:
    path("health", include(health_urls)),
    # Text and xml static files:
    path(
        "robots.txt",
        TemplateView.as_view(
            template_name="txt/robots.txt",
            content_type="text/plain",
        ),
    ),
    path(
        "humans.txt",
        TemplateView.as_view(
            template_name="txt/humans.txt",
            content_type="text/plain",
        ),
    ),
    # It is a good practice to have explicit index view:
    path("", include("src.Apps.system.urls")),
    path("", include("src.Apps.auth.urls")),
    path("", include("src.Apps.user.urls")),
    path("", include("src.Apps.gis_map.urls")),
    path("", include("src.Apps.detector.urls")),
]

if settings.DEBUG:  # pragma: no cover
    import debug_toolbar  # noqa: WPS433
    from django.conf.urls.static import static  # noqa: WPS433

    urlpatterns = [
        # URLs specific only to django-debug-toolbar:
        path("__debug__/", include(debug_toolbar.urls)),
        *urlpatterns,
        # Serving media files in development only:
        *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    ]
