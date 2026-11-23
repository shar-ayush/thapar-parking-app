from django.conf import settings
from django.db import models


class GateEvent(models.Model):
    class Kind(models.TextChoices):
        ENTRY = "ENTRY", "Entry"
        EXIT = "EXIT", "Exit"

    kind = models.CharField(max_length=10, choices=Kind.choices)
    booking = models.ForeignKey("bookings.Booking", on_delete=models.CASCADE, related_name="gate_events")
    plate_number = models.CharField(max_length=20)
    lot = models.ForeignKey("parking.ParkingLot", on_delete=models.CASCADE, related_name="gate_events")
    guard = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="gate_events"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.kind} {self.plate_number} @ {self.lot.code}"
