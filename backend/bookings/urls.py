from django.urls import path

from . import views

urlpatterns = [
    path("", views.bookings),
    path("current/", views.current),
    path("<int:pk>/cancel/", views.cancel),
]
