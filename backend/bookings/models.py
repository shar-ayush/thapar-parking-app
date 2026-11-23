from datetime import timedelta

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Booking(models.Model):
    """One visit to a slot: reserved in the app (or a walk-in at the gate),
    then checked in and out by a guard."""

    class Status(models.TextChoices):
        RESERVED = "RESERVED", "Reserved"
        ACTIVE = "ACTIVE", "Parked"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        EXPIRED = "EXPIRED", "Expired"

    OPEN = (Status.RESERVED, Status.ACTIVE)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )
    vehicle = models.ForeignKey(
        "vehicles.Vehicle", on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )
    # Snapshot so history survives if the vehicle is deleted, and so walk-ins
    # without a registered vehicle can still be tracked.
    plate_number = models.CharField(max_length=20, db_index=True)
    vehicle_type = models.CharField(max_length=20)
    slot = models.ForeignKey("parking.ParkingSlot", on_delete=models.PROTECT, related_name="bookings")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RESERVED, db_index=True)
    is_walk_in = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # A slot can only hold one open booking, and a plate can only be in one place.
            models.UniqueConstraint(
                fields=["slot"], condition=Q(status__in=["RESERVED", "ACTIVE"]), name="one_open_booking_per_slot"
            ),
            models.UniqueConstraint(
                fields=["plate_number"],
                condition=Q(status__in=["RESERVED", "ACTIVE"]),
                name="one_open_booking_per_plate",
            ),
        ]

    def __str__(self):
        return f"{self.plate_number} @ {self.slot} [{self.status}]"

    # --- helpers -----------------------------------------------------------

    @classmethod
    def expire_stale(cls):
        """Release reservations whose hold time ran out. Called lazily before
        any read/write that depends on availability (no background worker needed)."""
        return cls.objects.filter(status=cls.Status.RESERVED, expires_at__lt=timezone.now()).update(
            status=cls.Status.EXPIRED
        )

    @classmethod
    def open_qs(cls):
        cls.expire_stale()
        return cls.objects.filter(status__in=cls.OPEN)

    @classmethod
    def open_for_vehicle(cls, vehicle):
        return cls.open_qs().filter(vehicle=vehicle).first()

    @classmethod
    def new_expiry(cls):
        return timezone.now() + timedelta(minutes=settings.RESERVATION_MINUTES)
