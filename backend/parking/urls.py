from django.urls import path

from . import views

urlpatterns = [
    path("lots/", views.lot_list),
    path("lots/<slug:code>/", views.lot_detail),
    path("lots/<slug:code>/slots/", views.lot_slots),
]
