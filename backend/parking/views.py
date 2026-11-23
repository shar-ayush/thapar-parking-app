from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from bookings.models import Booking

from .models import ParkingLot, ParkingSlot, VehicleType
from .serializers import LotSerializer
from .services import availability


@api_view(["GET"])
def lot_list(request):
    lots = list(ParkingLot.objects.filter(is_active=True))
    ctx = {"availability": availability(lots)}
    return Response(LotSerializer(lots, many=True, context=ctx).data)


@api_view(["GET"])
def lot_detail(request, code):
    lot = get_object_or_404(ParkingLot, code=code, is_active=True)
    ctx = {"availability": availability([lot])}
    return Response(LotSerializer(lot, context=ctx).data)


@api_view(["GET"])
def lot_slots(request, code):
    """Slot map for one floor and vehicle type: ?floor=Ground&type=CAR"""
    lot = get_object_or_404(ParkingLot, code=code, is_active=True)
    vtype = request.query_params.get("type", VehicleType.CAR)
    floor = request.query_params.get("floor") or (lot.floors[0] if lot.floors else None)

    slots = ParkingSlot.objects.filter(lot=lot, vehicle_type=vtype, floor=floor).order_by("number")
    open_bookings = {b.slot_id: b for b in Booking.open_qs().filter(slot__lot=lot)}

    data = []
    for s in slots:
        b = open_bookings.get(s.id)
        data.append(
            {
                "id": s.id,
                "number": s.number,
                "label": s.label,
                "floor": s.floor,
                "occupied": bool(b) or not s.is_active,
                "blocked": not s.is_active,
                "mine": bool(b and b.user_id == request.user.id),
            }
        )
    return Response({"lot": lot.code, "floor": floor, "type": vtype, "slots": data})
