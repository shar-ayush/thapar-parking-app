from django.contrib import admin

from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ["plate_number", "vehicle_type", "owner", "make", "model", "color", "created_at"]
    list_filter = ["vehicle_type"]
    search_fields = ["plate_number", "owner__email", "owner__name"]
