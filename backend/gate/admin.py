from django.contrib import admin

from .models import GateEvent


@admin.register(GateEvent)
class GateEventAdmin(admin.ModelAdmin):
    list_display = ["created_at", "kind", "plate_number", "lot", "guard"]
    list_filter = ["kind", "lot"]
    search_fields = ["plate_number"]
    date_hierarchy = "created_at"
