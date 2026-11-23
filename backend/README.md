# Thapar Parking — API (Django)

## Run it

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_parking            # 4 lots, 990 slots (safe to re-run)
python manage.py seed_parking --demo     # optional: park ~40% fake cars so the app looks busy
python manage.py create_staff guard@thapar.edu secret123 --role GUARD --name "Main Gate"
python manage.py create_staff admin@thapar.edu secret123 --role ADMIN
python manage.py runserver 0.0.0.0:8000
ngrok http 8000                          # paste the https link into the app
```

The included `db.sqlite3` is already migrated and seeded; your existing accounts and vehicles are kept.
Remove demo cars with `python manage.py seed_parking --clear-demo`.

Tests: `python manage.py test` (18 end-to-end API tests).

## How parking works

1. A driver (student / faculty / visitor / vendor) picks a free slot in the app → **RESERVED**,
   held for `RESERVATION_MINUTES` (default 30). Unclaimed reservations expire automatically.
2. A guard types the plate at the gate → **Check in** → **ACTIVE** (parked).
3. On the way out the guard taps **Check out** → **COMPLETED**, slot is free again.
4. Cars without a reservation (or unregistered visitors) are admitted as **walk-ins** — the
   guard picks a lot and the first free slot of that vehicle type is assigned.

The database itself guarantees one open booking per slot and per number plate, so two people can't
grab the same slot even if they tap at the same moment.

## Roles

| Role | Can sign up in the app | App |
|---|---|---|
| Student, Faculty, Visitor, Vendor | yes | Driver app: home, map, reserve, vehicles, profile |
| Guard | no — `create_staff --role GUARD` or Django admin | Gate console, vehicles inside |
| Admin | no — `create_staff --role ADMIN` | Overview stats + gate + full Django admin at `/admin/` |

## API

All endpoints need `Authorization: Bearer <access>` except register, login, refresh and health.

| Method | Path | |
|---|---|---|
| POST | `/api/auth/register/` `login/` `refresh/` `logout/` | auth (access 60 min, refresh 30 days) |
| GET/PATCH | `/api/auth/me/` | profile (name, phone) |
| POST | `/api/auth/password/` | change password |
| CRUD | `/api/vehicles/` | my vehicles (plates normalised, e.g. `pb 11 ab 1234` → `PB11AB1234`) |
| GET | `/api/parking/lots/` · `/api/parking/lots/<id>/` | lots with live `capacity` / `free` per vehicle type |
| GET | `/api/parking/lots/<id>/slots/?floor=Ground&type=CAR` | slot map |
| GET/POST | `/api/bookings/` | my history / reserve `{slot_id, vehicle_id}` |
| GET | `/api/bookings/current/` | my open bookings |
| POST | `/api/bookings/<id>/cancel/` | cancel a reservation |
| GET | `/api/gate/lookup/?plate=` | guard: what's this plate allowed to do |
| POST | `/api/gate/check-in/` `{plate, lot?, vehicle_type?}` | guard |
| POST | `/api/gate/check-out/` `{plate}` | guard |
| GET | `/api/gate/events/` · `/api/gate/inside/?lot=` | guard: activity log, cars parked now |
| GET | `/api/dashboard/stats/` | admin overview |
| GET | `/api/dashboard/health/` | public health check (used by the Connect screen) |

## Settings

Environment variables: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG` (`1`/`0`), `DJANGO_ALLOWED_HOSTS`
(comma-separated, default `*` so ngrok links work), `RESERVATION_MINUTES`.
Set a real secret key and `DJANGO_DEBUG=0` before putting this anywhere public.

Lot coordinates in `parking/management/commands/seed_parking.py` are approximate — fix them in
`/admin/` → Parking lots once you've checked the real spots. Untick a slot's *active* box to block it.
