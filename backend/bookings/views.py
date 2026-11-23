from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from parking.models import ParkingSlot
from vehicles.models import Vehicle

from .models import Booking
from .serializers import BookingSerializer, CreateBookingSerializer


def _err(message, code=status.HTTP_400_BAD_REQUEST):
    return Response({"success": False, "message": message}, status=code)


def _with_related(qs):
    return qs.select_related("slot__lot", "user")


@api_view(["GET", "POST"])
def bookings(request):
    if request.method == "GET":
        Booking.expire_stale()
        qs = _with_related(Booking.objects.filter(user=request.user))[:30]
        return Response(BookingSerializer(qs, many=True).data)

    if request.user.is_gate_staff:
        return _err("Guard and admin accounts can't reserve slots.", status.HTTP_403_FORBIDDEN)

    s = CreateBookingSerializer(data=request.data)
    s.is_valid(raise_exception=True)

    vehicle = Vehicle.objects.filter(id=s.validated_data["vehicle_id"], owner=request.user).first()
    if not vehicle:
        return _err("Pick one of your registered vehicles.")

    slot = ParkingSlot.objects.select_related("lot").filter(id=s.validated_data["slot_id"]).first()
    if not slot or not slot.is_active or not slot.lot.is_active:
        return _err("That slot isn't available.")
    if slot.vehicle_type != vehicle.vehicle_type:
        return _err(f"That is a {slot.get_vehicle_type_display().lower()} slot - your {vehicle.plate_number} is a {vehicle.get_vehicle_type_display().lower()}.")

    open_qs = Booking.open_qs()
    if open_qs.filter(user=request.user, is_walk_in=False, status=Booking.Status.RESERVED).exists():
        return _err("You already have a reservation. Cancel it before booking another slot.", status.HTTP_409_CONFLICT)
    if open_qs.filter(plate_number=vehicle.plate_number).exists():
        return _err("This vehicle already has a booking or is parked.", status.HTTP_409_CONFLICT)
    if open_qs.filter(slot=slot).exists():
        return _err("Someone just took that slot. Pick another one.", status.HTTP_409_CONFLICT)

    try:
        with transaction.atomic():
            booking = Booking.objects.create(
                user=request.user,
                vehicle=vehicle,
                plate_number=vehicle.plate_number,
                vehicle_type=vehicle.vehicle_type,
                slot=slot,
                status=Booking.Status.RESERVED,
                expires_at=Booking.new_expiry(),
            )
    except IntegrityError:
        # Lost a race with another user for the same slot.
        return _err("Someone just took that slot. Pick another one.", status.HTTP_409_CONFLICT)

    return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def current(request):
    """The user's open bookings (reserved or parked), newest first."""
    qs = _with_related(Booking.open_qs().filter(user=request.user))
    return Response(BookingSerializer(qs, many=True).data)


@api_view(["POST"])
def cancel(request, pk):
    booking = Booking.open_qs().filter(pk=pk, user=request.user).first()
    if not booking:
        return _err("Booking not found or already finished.", status.HTTP_404_NOT_FOUND)
    if booking.status != Booking.Status.RESERVED:
        return _err("You're already parked - a guard checks you out at the gate.")
    booking.status = Booking.Status.CANCELLED
    booking.cancelled_at = timezone.now()
    booking.save(update_fields=["status", "cancelled_at"])
    return Response(BookingSerializer(booking).data)
