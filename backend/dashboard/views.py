from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsAdminRole
from bookings.models import Booking
from gate.models import GateEvent
from parking.models import ParkingLot
from parking.services import TYPES, availability
from vehicles.models import Vehicle


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"success": True, "message": "Thapar Parking API is running"})


@api_view(["GET"])
@permission_classes([IsAdminRole])
def stats(request):
    now = timezone.localtime()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    lots = list(ParkingLot.objects.filter(is_active=True))
    avail = availability(lots)
    open_qs = Booking.open_qs()
    parked_by_lot = dict(
        open_qs.filter(status=Booking.Status.ACTIVE).values_list("slot__lot_id").annotate(n=Count("id"))
    )
    reserved_by_lot = dict(
        open_qs.filter(status=Booking.Status.RESERVED).values_list("slot__lot_id").annotate(n=Count("id"))
    )

    lot_rows = []
    total_cap = total_free = 0
    for lot in lots:
        a = avail[lot.id]
        cap, free = sum(a["capacity"].values()), sum(a["free"].values())
        total_cap += cap
        total_free += free
        lot_rows.append(
            {
                "id": lot.code,
                "name": lot.name,
                "zone": lot.zone,
                "capacity": cap,
                "free": free,
                "parked": parked_by_lot.get(lot.id, 0),
                "reserved": reserved_by_lot.get(lot.id, 0),
                "by_type": {t: {"capacity": a["capacity"][t], "free": a["free"][t]} for t in TYPES},
            }
        )

    events_today = GateEvent.objects.filter(created_at__gte=today)
    # Entries per hour for the last 12 hours, oldest first.
    hours = []
    start = now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=11)
    for i in range(12):
        h0 = start + timedelta(hours=i)
        hours.append(
            {
                "hour": h0.strftime("%H:00"),
                "entries": GateEvent.objects.filter(
                    kind=GateEvent.Kind.ENTRY, created_at__gte=h0, created_at__lt=h0 + timedelta(hours=1)
                ).count(),
            }
        )

    return Response(
        {
            "capacity": total_cap,
            "free": total_free,
            "parked": open_qs.filter(status=Booking.Status.ACTIVE).count(),
            "reserved": open_qs.filter(status=Booking.Status.RESERVED).count(),
            "entries_today": events_today.filter(kind=GateEvent.Kind.ENTRY).count(),
            "exits_today": events_today.filter(kind=GateEvent.Kind.EXIT).count(),
            "bookings_today": Booking.objects.filter(created_at__gte=today, is_walk_in=False).count(),
            "walk_ins_today": Booking.objects.filter(created_at__gte=today, is_walk_in=True).count(),
            "users": dict(User.objects.values_list("role").annotate(n=Count("id"))),
            "vehicles": Vehicle.objects.count(),
            "lots": lot_rows,
            "entries_by_hour": hours,
        }
    )
