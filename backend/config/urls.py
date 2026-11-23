from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Thapar Parking admin"
admin.site.site_title = "Thapar Parking"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/vehicles/", include("vehicles.urls")),
    path("api/parking/", include("parking.urls")),
    path("api/bookings/", include("bookings.urls")),
    path("api/gate/", include("gate.urls")),
]
