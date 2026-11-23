from django.contrib import admin

from .models import ParkingLot, ParkingSlot


class SlotInline(admin.TabularInline):
    model = ParkingSlot
    extra = 0
    fields = ["floor", "floor_index", "vehicle_type", "number", "is_active"]


@admin.register(ParkingLot)
class ParkingLotAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "zone", "area", "is_active"]
    list_filter = ["zone", "is_active"]
    prepopulated_fields = {"code": ("name",)}
    inlines = [SlotInline]


@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = ["__str__", "lot", "floor", "vehicle_type", "number", "is_active"]
    list_filter = ["lot", "vehicle_type", "floor", "is_active"]
    list_editable = ["is_active"]
