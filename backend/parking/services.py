from collections import defaultdict

from django.db.models import Count

from bookings.models import Booking

from .models import ParkingSlot, VehicleType

TYPES = [t.value for t in VehicleType]


def availability(lots):
    """Return {lot_id: {"capacity": {...}, "free": {...}}} for the given lots
    using two aggregate queries instead of one per lot."""
    lot_ids = [lot.id for lot in lots]
    result = {lid: {"capacity": dict.fromkeys(TYPES, 0), "free": dict.fromkeys(TYPES, 0)} for lid in lot_ids}

    caps = (
        ParkingSlot.objects.filter(lot_id__in=lot_ids, is_active=True)
        .values("lot_id", "vehicle_type")
        .annotate(n=Count("id"))
    )
    for row in caps:
        result[row["lot_id"]]["capacity"][row["vehicle_type"]] = row["n"]

    taken = (
        Booking.open_qs()
        .filter(slot__lot_id__in=lot_ids, slot__is_active=True)
        .values("slot__lot_id", "slot__vehicle_type")
        .annotate(n=Count("id"))
    )
    used = defaultdict(int)
    for row in taken:
        used[(row["slot__lot_id"], row["slot__vehicle_type"])] = row["n"]

    for lid, data in result.items():
        for t in TYPES:
            data["free"][t] = max(data["capacity"][t] - used[(lid, t)], 0)
    return result


def first_free_slot(lot, vehicle_type):
    taken = Booking.open_qs().filter(slot__lot=lot).values_list("slot_id", flat=True)
    return (
        ParkingSlot.objects.filter(lot=lot, vehicle_type=vehicle_type, is_active=True)
        .exclude(id__in=list(taken))
        .order_by("floor_index", "number")
        .first()
    )
