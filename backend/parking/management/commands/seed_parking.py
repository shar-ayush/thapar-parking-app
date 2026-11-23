import random

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from bookings.models import Booking
from parking.models import ParkingLot, ParkingSlot

# Coordinates are approximate - correct them in /admin once you've checked the real spots.
LOTS = [
    {
        "code": "main-gate", "name": "Main Gate Parking", "zone": "A", "area": "Near Main Gate",
        "lat": 30.3535, "lng": 76.364, "floors": ["Ground", "1st", "2nd"],
        "capacity": {"CAR": 80, "BIKE": 120, "SCOOTER": 90},
    },
    {
        "code": "library", "name": "Library Block Lot", "zone": "B", "area": "Central Campus",
        "lat": 30.3568, "lng": 76.3655, "floors": ["Ground", "1st"],
        "capacity": {"CAR": 40, "BIKE": 100, "SCOOTER": 60},
    },
    {
        "code": "sports", "name": "Sports Complex", "zone": "C", "area": "East Side",
        "lat": 30.359, "lng": 76.3695, "floors": ["Ground"],
        "capacity": {"CAR": 60, "BIKE": 80, "SCOOTER": 70},
    },
    {
        "code": "hostel", "name": "Hostel Area Parking", "zone": "D", "area": "North Campus",
        "lat": 30.3615, "lng": 76.364, "floors": ["Ground", "1st"],
        "capacity": {"CAR": 30, "BIKE": 150, "SCOOTER": 110},
    },
]


class Command(BaseCommand):
    help = "Create the campus parking lots and their slots. Safe to run more than once."

    def add_arguments(self, parser):
        parser.add_argument(
            "--demo", action="store_true",
            help="Also fill ~40%% of slots with fake parked vehicles (plates DEMO0001...) so the app looks busy.",
        )
        parser.add_argument("--clear-demo", action="store_true", help="Remove the fake DEMO vehicles.")

    @transaction.atomic
    def handle(self, *args, demo=False, clear_demo=False, **opts):
        if clear_demo:
            n = Booking.objects.filter(plate_number__startswith="DEMO").delete()[0]
            self.stdout.write(self.style.SUCCESS(f"Removed {n} demo bookings."))
            return

        created_slots = 0
        for spec in LOTS:
            spec = dict(spec)
            capacity = spec.pop("capacity")
            lot, _ = ParkingLot.objects.update_or_create(code=spec["code"], defaults=spec)
            floors = lot.floors or ["Ground"]
            for vtype, total in capacity.items():
                # Spread slots as evenly as possible across floors.
                per_floor = [total // len(floors) + (1 if i < total % len(floors) else 0) for i in range(len(floors))]
                for fi, (floor, count) in enumerate(zip(floors, per_floor)):
                    for n in range(1, count + 1):
                        _, made = ParkingSlot.objects.get_or_create(
                            lot=lot, floor=floor, vehicle_type=vtype, number=n, defaults={"floor_index": fi}
                        )
                        created_slots += made
        self.stdout.write(self.style.SUCCESS(f"{len(LOTS)} lots ready, {created_slots} new slots created."))

        if demo:
            self._demo()

    def _demo(self):
        rng = random.Random(42)
        taken = set(Booking.open_qs().values_list("slot_id", flat=True))
        i = Booking.objects.filter(plate_number__startswith="DEMO").count()
        now = timezone.now()
        made = 0
        for slot in ParkingSlot.objects.filter(is_active=True).exclude(id__in=taken):
            if rng.random() < 0.4:
                i += 1
                Booking.objects.create(
                    plate_number=f"DEMO{i:04d}", vehicle_type=slot.vehicle_type, slot=slot,
                    status=Booking.Status.ACTIVE, is_walk_in=True, checked_in_at=now,
                )
                made += 1
        self.stdout.write(self.style.SUCCESS(f"Parked {made} demo vehicles. Remove them with --clear-demo."))
