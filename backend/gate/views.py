from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.permissions import IsGateStaff
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from parking.models import ParkingLot, VehicleType
from parking.services import first_free_slot
from vehicles.models import Vehicle
from vehicles.serializers import normalize_plate

from .models import GateEvent


def _err(message, code=status.HTTP_400_BAD_REQUEST):
    return Response({"success": False, "message": message}, status=code)


def _vehicle_info(plate):
    v = Vehicle.objects.select_related("owner").filter(plate_number=plate).first()
    if not v:
        return None
    return {
        "plate_number": v.plate_number,
        "vehicle_type": v.vehicle_type,
        "description": " ".join(x for x in [v.color, v.make, v.model] if x),
        "owner": {"name": v.owner.name, "email": v.owner.email, "phone": v.owner.phone, "role": v.owner.role},
    }


def _event_json(e):
    return {
        "id": e.id,
        "kind": e.kind,
        "plate_number": e.plate_number,
        "lot": e.lot.name,
        "slot_label": e.booking.slot.label,
        "floor": e.booking.slot.floor,
        "created_at": e.created_at,
    }


@api_view(["GET"])
@permission_classes([IsGateStaff])
def lookup(request):
    plate = normalize_plate(request.query_params.get("plate", ""))
    if len(plate) < 3:
        return _err("Enter a vehicle number.")
    booking = Booking.open_qs().select_related("slot__lot", "user").filter(plate_number=plate).first()
    return Response(
        {
            "plate_number": plate,
            "vehicle": _vehicle_info(plate),
            "booking": BookingSerializer(booking).data if booking else None,
        }
    )


@api_view(["POST"])
@permission_classes([IsGateStaff])
def check_in(request):
    """Let a vehicle in. Uses its reservation if it has one; otherwise it is a
    walk-in and gets the first free slot of its type in the chosen lot."""
    plate = normalize_plate(request.data.get("plate", ""))
    if len(plate) < 3:
        return _err("Enter a vehicle number.")

    now = timezone.now()
    booking = Booking.open_qs().select_related("slot__lot").filter(plate_number=plate).first()

    if booking and booking.status == Booking.Status.ACTIVE:
        return _err(f"{plate} is already inside ({booking.slot.lot.name}, {booking.slot.label}).", status.HTTP_409_CONFLICT)

    if booking:  # reserved in the app
        booking.status = Booking.Status.ACTIVE
        booking.checked_in_at = now
        booking.save(update_fields=["status", "checked_in_at"])
    else:  # walk-in
        lot = ParkingLot.objects.filter(code=request.data.get("lot"), is_active=True).first()
        if not lot:
            return _err("No reservation for this vehicle. Pick a lot to admit it as a walk-in.")
        vehicle = Vehicle.objects.filter(plate_number=plate).first()
        vtype = vehicle.vehicle_type if vehicle else request.data.get("vehicle_type", VehicleType.CAR)
        if vtype not in VehicleType.values:
            return _err("Unknown vehicle type.")
        slot = first_free_slot(lot, vtype)
        if not slot:
            return _err(f"{lot.name} has no free {vtype.lower()} slots.", status.HTTP_409_CONFLICT)
        try:
            with transaction.atomic():
                booking = Booking.objects.create(
                    user=vehicle.owner if vehicle else None,
                    vehicle=vehicle,
                    plate_number=plate,
                    vehicle_type=vtype,
                    slot=slot,
                    status=Booking.Status.ACTIVE,
                    is_walk_in=True,
                    checked_in_at=now,
                )
        except IntegrityError:
            return _err("That slot was just taken. Try again.", status.HTTP_409_CONFLICT)

    GateEvent.objects.create(
        kind=GateEvent.Kind.ENTRY, booking=booking, plate_number=plate, lot=booking.slot.lot, guard=request.user
    )
    booking = Booking.objects.select_related("slot__lot", "user").get(pk=booking.pk)
    return Response({"success": True, "message": f"{plate} checked in.", "booking": BookingSerializer(booking).data})


@api_view(["POST"])
@permission_classes([IsGateStaff])
def check_out(request):
    plate = normalize_plate(request.data.get("plate", ""))
    booking = Booking.open_qs().select_related("slot__lot", "user").filter(plate_number=plate).first()
    if not booking:
        return _err(f"{plate or 'This vehicle'} isn't parked on campus.", status.HTTP_404_NOT_FOUND)
    if booking.status != Booking.Status.ACTIVE:
        return _err(f"{plate} has a reservation but never checked in.")

    booking.status = Booking.Status.COMPLETED
    booking.checked_out_at = timezone.now()
    booking.save(update_fields=["status", "checked_out_at"])
    GateEvent.objects.create(
        kind=GateEvent.Kind.EXIT, booking=booking, plate_number=plate, lot=booking.slot.lot, guard=request.user
    )
    return Response({"success": True, "message": f"{plate} checked out.", "booking": BookingSerializer(booking).data})


@api_view(["GET"])
@permission_classes([IsGateStaff])
def events(request):
    qs = GateEvent.objects.select_related("lot", "booking__slot")[:40]
    return Response([_event_json(e) for e in qs])


@api_view(["GET"])
@permission_classes([IsGateStaff])
def inside(request):
    """Vehicles currently parked, optionally for one lot (?lot=main-gate)."""
    qs = Booking.open_qs().filter(status=Booking.Status.ACTIVE).select_related("slot__lot", "user")
    if request.query_params.get("lot"):
        qs = qs.filter(slot__lot__code=request.query_params["lot"])
    return Response(BookingSerializer(qs.order_by("-checked_in_at")[:100], many=True).data)
