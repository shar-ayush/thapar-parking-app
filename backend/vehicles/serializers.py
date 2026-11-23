import re

from rest_framework import serializers

from .models import Vehicle


def normalize_plate(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", (value or "").upper())


class VehicleSerializer(serializers.ModelSerializer):
    # Declared explicitly so uniqueness is checked on the *normalised* plate
    # ("pb 11 ab 1234" and "PB11AB1234" are the same vehicle).
    plate_number = serializers.CharField(max_length=20)

    class Meta:
        model = Vehicle
        fields = ["id", "plate_number", "vehicle_type", "make", "model", "color", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_plate_number(self, value):
        plate = normalize_plate(value)
        if len(plate) < 4:
            raise serializers.ValidationError("Enter a valid vehicle number.")
        qs = Vehicle.objects.filter(plate_number=plate)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This vehicle is already registered.")
        return plate
