from django.urls import path

from .views import health_check, stats

urlpatterns = [
    path("health/", health_check),
    path("stats/", stats),
]
