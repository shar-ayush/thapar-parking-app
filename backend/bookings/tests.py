"""End-to-end API tests: python manage.py test"""
from datetime import timedelta

from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import User
from bookings.models import Booking
from parking.models import ParkingSlot


class Base(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_parking", verbosity=0)
        cls.guard = User.objects.create_user(email="guard@t.edu", password="secret12", name="G", role="GUARD")
        cls.admin = User.objects.create_user(email="admin@t.edu", password="secret12", name="A", role="ADMIN")

    def signup(self, email="stu@t.edu", role="STUDENT"):
        r = self.client.post("/api/auth/register/", {
            "email": email, "password": "secret12", "name": "Stu Dent", "phone": "", "role": role,
        }, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        return r.data

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def as_user(self, user):
        self.client.force_authenticate(user)

    def add_vehicle(self, plate="pb 11 ab 1234", vtype="CAR"):
        r = self.client.post("/api/vehicles/", {"plate_number": plate, "vehicle_type": vtype}, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        return r.data

    def free_slot(self, lot="main-gate", vtype="CAR"):
        r = self.client.get(f"/api/parking/lots/{lot}/slots/?type={vtype}")
        return next(s for s in r.data["slots"] if not s["occupied"])


class AuthTests(Base):
    def test_health_is_public(self):
        self.assertEqual(self.client.get("/api/dashboard/health/").status_code, 200)

    def test_cannot_self_register_as_admin_or_guard(self):
        for role in ("ADMIN", "GUARD"):
            r = self.client.post("/api/auth/register/", {
                "email": f"x{role}@t.edu", "password": "secret12", "name": "X", "role": role,
            }, format="json")
            self.assertEqual(r.status_code, 400)

    def test_login_is_case_insensitive_and_refresh_works(self):
        self.signup("Mixed@T.edu")
        r = self.client.post("/api/auth/login/", {"email": "MIXED@t.edu", "password": "secret12"}, format="json")
        self.assertEqual(r.status_code, 200)
        r2 = self.client.post("/api/auth/refresh/", {"refresh": r.data["refresh"]}, format="json")
        self.assertEqual(r2.status_code, 200)
        self.assertIn("access", r2.data)

    def test_refresh_rejected_after_logout(self):
        data = self.signup()
        self.auth(data["access"])
        self.client.post("/api/auth/logout/", {"refresh": data["refresh"]}, format="json")
        self.client.credentials()
        r = self.client.post("/api/auth/refresh/", {"refresh": data["refresh"]}, format="json")
        self.assertEqual(r.status_code, 401)

    def test_update_profile(self):
        self.auth(self.signup()["access"])
        r = self.client.patch("/api/auth/me/", {"phone": "98765", "role": "ADMIN"}, format="json")
        self.assertEqual(r.data["user"]["phone"], "98765")
        self.assertEqual(r.data["user"]["role"], "STUDENT")  # role is read-only


class VehicleTests(Base):
    def test_plate_normalised_and_unique(self):
        self.auth(self.signup()["access"])
        v = self.add_vehicle("pb 11-ab 1234")
        self.assertEqual(v["plate_number"], "PB11AB1234")
        r = self.client.post("/api/vehicles/", {"plate_number": "PB11AB1234", "vehicle_type": "CAR"}, format="json")
        self.assertEqual(r.status_code, 400)


class ParkingTests(Base):
    def test_lots_have_capacity_and_free(self):
        self.as_user(self.guard)
        r = self.client.get("/api/parking/lots/")
        self.assertEqual(len(r.data), 4)
        main = next(l for l in r.data if l["id"] == "main-gate")
        self.assertEqual(main["capacity"]["CAR"], 80)
        self.assertEqual(main["free"]["CAR"], 80)

    def test_seed_is_idempotent(self):
        before = ParkingSlot.objects.count()
        call_command("seed_parking", verbosity=0)
        self.assertEqual(ParkingSlot.objects.count(), before)


class BookingFlowTests(Base):
    def setUp(self):
        self.auth(self.signup()["access"])
        self.vehicle = self.add_vehicle()

    def book(self, slot_id=None, vehicle_id=None):
        return self.client.post("/api/bookings/", {
            "slot_id": slot_id or self.free_slot()["id"], "vehicle_id": vehicle_id or self.vehicle["id"],
        }, format="json")

    def test_full_flow_reserve_checkin_checkout(self):
        slot = self.free_slot()
        r = self.book(slot["id"])
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data["status"], "RESERVED")

        # Slot now shows taken (and mine), and free count dropped.
        slots = self.client.get("/api/parking/lots/main-gate/slots/?type=CAR").data["slots"]
        me = next(s for s in slots if s["id"] == slot["id"])
        self.assertTrue(me["occupied"] and me["mine"])
        lot = self.client.get("/api/parking/lots/main-gate/").data
        self.assertEqual(lot["free"]["CAR"], 79)

        # Guard checks the car in and out.
        user_creds = self.client._credentials
        self.client.credentials()
        self.as_user(self.guard)
        look = self.client.get("/api/gate/lookup/?plate=pb11ab1234")
        self.assertEqual(look.data["booking"]["status"], "RESERVED")
        self.assertEqual(self.client.post("/api/gate/check-in/", {"plate": "PB11AB1234"}, format="json").status_code, 200)
        self.assertEqual(self.client.post("/api/gate/check-in/", {"plate": "PB11AB1234"}, format="json").status_code, 409)
        self.assertEqual(len(self.client.get("/api/gate/inside/").data), 1)
        r = self.client.post("/api/gate/check-out/", {"plate": "PB11AB1234"}, format="json")
        self.assertEqual(r.data["booking"]["status"], "COMPLETED")
        self.assertEqual(len(self.client.get("/api/gate/events/").data), 2)

        self.client.force_authenticate(None)
        self.client.credentials(**user_creds)
        self.assertEqual(self.client.get("/api/bookings/current/").data, [])
        self.assertEqual(self.client.get("/api/bookings/").data[0]["status"], "COMPLETED")

    def test_one_reservation_at_a_time(self):
        self.assertEqual(self.book().status_code, 201)
        self.assertEqual(self.book().status_code, 409)

    def test_slot_cannot_be_double_booked(self):
        slot = self.free_slot()
        self.assertEqual(self.book(slot["id"]).status_code, 201)
        self.client.credentials()
        self.auth(self.signup("other@t.edu")["access"])
        other = self.add_vehicle("HR01ZZ0001")
        self.assertEqual(self.book(slot["id"], other["id"]).status_code, 409)

    def test_wrong_vehicle_type_rejected(self):
        bike_slot = self.free_slot(vtype="BIKE")
        self.assertEqual(self.book(bike_slot["id"]).status_code, 400)

    def test_cancel_frees_slot(self):
        b = self.book().data
        r = self.client.post(f"/api/bookings/{b['id']}/cancel/")
        self.assertEqual(r.data["status"], "CANCELLED")
        self.assertEqual(self.book().status_code, 201)

    def test_reservation_expires(self):
        b = self.book().data
        Booking.objects.filter(pk=b["id"]).update(expires_at=timezone.now() - timedelta(minutes=1))
        self.assertEqual(self.client.get("/api/bookings/current/").data, [])
        self.assertEqual(Booking.objects.get(pk=b["id"]).status, "EXPIRED")

    def test_cannot_delete_vehicle_with_open_booking(self):
        self.book()
        r = self.client.delete(f"/api/vehicles/{self.vehicle['id']}/")
        self.assertEqual(r.status_code, 400)

    def test_students_cannot_use_gate_or_stats(self):
        self.assertEqual(self.client.post("/api/gate/check-in/", {"plate": "X"}, format="json").status_code, 403)
        self.assertEqual(self.client.get("/api/dashboard/stats/").status_code, 403)


class GateWalkInTests(Base):
    def test_walk_in_unregistered_vehicle(self):
        self.as_user(self.guard)
        r = self.client.post("/api/gate/check-in/", {"plate": "dl 3c ab 0001"}, format="json")
        self.assertEqual(r.status_code, 400)  # needs a lot
        r = self.client.post("/api/gate/check-in/", {"plate": "dl 3c ab 0001", "lot": "library", "vehicle_type": "BIKE"}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertTrue(r.data["booking"]["is_walk_in"])
        self.assertEqual(r.data["booking"]["vehicle_type"], "BIKE")

    def test_admin_stats(self):
        self.as_user(self.admin)
        r = self.client.get("/api/dashboard/stats/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["capacity"], sum(l["capacity"] for l in r.data["lots"]))
        self.assertEqual(len(r.data["entries_by_hour"]), 12)
