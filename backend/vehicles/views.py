from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from bookings.models import Booking

from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user).order_by("created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if "vehicle_type" in serializer.validated_data and Booking.open_for_vehicle(serializer.instance):
            raise ValidationError({"message": "Finish or cancel this vehicle's booking first."})
        serializer.save()

    def perform_destroy(self, instance):
        if Booking.open_for_vehicle(instance):
            raise ValidationError({"message": "This vehicle has an active booking. Cancel it or check out first."})
        instance.delete()
