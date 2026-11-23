from django.urls import path

from . import views

urlpatterns = [
    path("lookup/", views.lookup),
    path("check-in/", views.check_in),
    path("check-out/", views.check_out),
    path("events/", views.events),
    path("inside/", views.inside),
]
