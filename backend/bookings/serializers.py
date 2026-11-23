from rest_framework import serializers

from parking.serializers import LotBriefSerializer

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    lot = LotBriefSerializer(source="slot.lot")
    floor = serializers.CharField(source="slot.floor")
    slot_label = serializers.CharField(source="slot.label")
    slot_number = serializers.IntegerField(source="slot.number")
    user = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "status",
            "plate_number",
            "vehicle_type",
            "is_walk_in",
            "lot",
            "floor",
            "slot_label",
            "slot_number",
            "user",
            "created_at",
            "expires_at",
            "checked_in_at",
            "checked_out_at",
        ]

    def get_user(self, obj):
        if not obj.user:
            return None
        u = obj.user
        return {"name": u.name, "email": u.email, "phone": u.phone, "role": u.role}


class CreateBookingSerializer(serializers.Serializer):
    slot_id = serializers.IntegerField()
    vehicle_id = serializers.IntegerField()
