from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["plate_number", "status", "slot", "user", "is_walk_in", "created_at", "checked_in_at", "checked_out_at"]
    list_filter = ["status", "is_walk_in", "slot__lot", "vehicle_type"]
    search_fields = ["plate_number", "user__email", "user__name"]
    raw_id_fields = ["user", "vehicle", "slot"]
    date_hierarchy = "created_at"
