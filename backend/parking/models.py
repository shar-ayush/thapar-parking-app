from django.db import models


class VehicleType(models.TextChoices):
    CAR = "CAR", "Car"
    BIKE = "BIKE", "Bike"
    SCOOTER = "SCOOTER", "Scooter"


class ParkingLot(models.Model):
    class Zone(models.TextChoices):
        A = "A", "Zone A"
        B = "B", "Zone B"
        C = "C", "Zone C"
        D = "D", "Zone D"

    code = models.SlugField(max_length=50, unique=True, help_text="Short id used by the app, e.g. main-gate")
    name = models.CharField(max_length=120)
    zone = models.CharField(max_length=1, choices=Zone.choices)
    area = models.CharField(max_length=120, blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    floors = models.JSONField(default=list, help_text='Floor names in display order, e.g. ["Ground", "1st"]')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["zone", "name"]

    def __str__(self):
        return f"{self.name} (Zone {self.zone})"


class ParkingSlot(models.Model):
    lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name="slots")
    floor = models.CharField(max_length=30)
    floor_index = models.PositiveSmallIntegerField(default=0)
    number = models.PositiveIntegerField()
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices)
    is_active = models.BooleanField(default=True, help_text="Untick to block a slot (repairs, reserved for staff, ...)")

    class Meta:
        ordering = ["lot", "floor_index", "vehicle_type", "number"]
        constraints = [
            models.UniqueConstraint(
                fields=["lot", "floor", "vehicle_type", "number"],
                name="unique_slot_per_lot_floor_type",
            )
        ]

    @property
    def label(self):
        prefix = {"CAR": "C", "BIKE": "B", "SCOOTER": "S"}.get(self.vehicle_type, "")
        return f"{prefix}{self.number:02d}"

    def __str__(self):
        return f"{self.lot.code} / {self.floor} / {self.label}"
