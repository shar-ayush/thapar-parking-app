This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where empty lines have been removed.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: backend
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
backend/
  accounts/
    management/
      commands/
        __init__.py
        create_staff.py
      __init__.py
    migrations/
      __init__.py
      0001_initial.py
      0002_alter_user_managers.py
    __init__.py
    admin.py
    apps.py
    models.py
    permissions.py
    serializers.py
    urls.py
    views.py
  authorizations/
    migrations/
      __init__.py
    __init__.py
    admin.py
    apps.py
    models.py
    views.py
  bookings/
    migrations/
      __init__.py
      0001_initial.py
    __init__.py
    admin.py
    apps.py
    models.py
    serializers.py
    tests.py
    urls.py
    views.py
  config/
    __init__.py
    asgi.py
    settings.py
    urls.py
    wsgi.py
  dashboard/
    migrations/
      __init__.py
    __init__.py
    admin.py
    apps.py
    models.py
    urls.py
    views.py
  gate/
    migrations/
      __init__.py
      0001_initial.py
    __init__.py
    admin.py
    apps.py
    models.py
    urls.py
    views.py
  notifications/
    migrations/
      __init__.py
    __init__.py
    admin.py
    apps.py
    models.py
    views.py
  parking/
    management/
      commands/
        __init__.py
        seed_parking.py
      __init__.py
    migrations/
      __init__.py
      0001_initial.py
    __init__.py
    admin.py
    apps.py
    models.py
    serializers.py
    services.py
    urls.py
    views.py
  vehicles/
    migrations/
      __init__.py
      0001_initial.py
    __init__.py
    admin.py
    apps.py
    models.py
    serializers.py
    urls.py
    views.py
  .gitignore
  db.sqlite3
  manage.py
  README.md
  requirements.txt
````

# Files

## File: backend/accounts/management/commands/__init__.py
````python

````

## File: backend/accounts/management/commands/create_staff.py
````python
from django.core.management.base import BaseCommand, CommandError
from accounts.models import User
class Command(BaseCommand):
    help = "Create (or update) a Guard or Admin account. These roles can't be chosen at sign-up."
    def add_arguments(self, parser):
        parser.add_argument("email")
        parser.add_argument("password")
        parser.add_argument("--role", choices=["GUARD", "ADMIN"], default="GUARD")
        parser.add_argument("--name", default="")
    def handle(self, email, password, role, name, **opts):
        if len(password) < 6:
            raise CommandError("Password must be at least 6 characters.")
        email = email.strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(email=email, password=password, name=name or role.title(), role=role)
            action = "Created"
        else:
            user.role = role
            user.set_password(password)
            if name:
                user.name = name
            user.save()
            action = "Updated"
        # Admins get full access to the Django admin site; guards only use the app.
        user.is_staff = user.is_superuser = role == "ADMIN"
        user.save(update_fields=["is_staff", "is_superuser"])
        self.stdout.write(self.style.SUCCESS(f"{action} {role.lower()} account {user.email}"))
````

## File: backend/accounts/management/__init__.py
````python

````

## File: backend/accounts/migrations/__init__.py
````python

````

## File: backend/accounts/migrations/0001_initial.py
````python
# Generated by Django 5.2.17 on 2026-09-20 05:54
import django.contrib.auth.models
import django.utils.timezone
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]
    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('name', models.CharField(max_length=150)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('role', models.CharField(choices=[('STUDENT', 'Student'), ('FACULTY', 'Faculty'), ('VISITOR', 'Visitor'), ('VENDOR', 'Vendor'), ('GUARD', 'Guard'), ('ADMIN', 'Admin')], default='STUDENT', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
````

## File: backend/accounts/migrations/0002_alter_user_managers.py
````python
# Generated by Django 6.1.3 on 2026-11-22 15:42
from django.db import migrations
class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]
    operations = [
        migrations.AlterModelManagers(
            name="user",
            managers=[],
        ),
    ]
````

## File: backend/accounts/__init__.py
````python

````

## File: backend/accounts/admin.py
````python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-created_at"]
    list_display = ["email", "name", "role", "phone", "is_active", "created_at"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["email", "name", "phone"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("name", "phone", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "role", "password1", "password2"),
        }),
    )
````

## File: backend/accounts/apps.py
````python
from django.apps import AppConfig
class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
````

## File: backend/accounts/models.py
````python
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email).lower()
        user = self.model(
            email=email,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "ADMIN")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")
        return self.create_user(
            email=email,
            password=password,
            **extra_fields
        )
class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        FACULTY = "FACULTY", "Faculty"
        VISITOR = "VISITOR", "Visitor"
        VENDOR = "VENDOR", "Vendor"
        GUARD = "GUARD", "Guard"
        ADMIN = "ADMIN", "Admin"
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    phone = models.CharField(
        max_length=20,
        blank=True
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()
    # Roles that park their own vehicle (they all get the same driver app).
    DRIVER_ROLES = {Role.STUDENT, Role.FACULTY, Role.VISITOR, Role.VENDOR}
    # Roles people may pick for themselves at sign-up.
    SELF_SERVICE_ROLES = DRIVER_ROLES
    @property
    def is_gate_staff(self):
        return self.role in (self.Role.GUARD, self.Role.ADMIN) or self.is_staff
    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN or self.is_superuser
    def __str__(self):
        return self.email
````

## File: backend/accounts/permissions.py
````python
from rest_framework.permissions import BasePermission
class IsGateStaff(BasePermission):
    """Guards and admins: may check vehicles in and out at the gate."""
    message = "Only guards can do this."
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_gate_staff)
class IsAdminRole(BasePermission):
    message = "Only admins can see this."
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_admin_role)
````

## File: backend/accounts/serializers.py
````python
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = User
        fields = ["email", "password", "name", "phone", "role"]
    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value
    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name is required.")
        return value
    def validate_role(self, value):
        # Guard / Admin accounts are created by an admin, never through sign-up.
        if value not in User.SELF_SERVICE_ROLES:
            raise serializers.ValidationError("You can't sign up with this role.")
        return value
    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, attrs):
        email = attrs["email"].strip()
        # Emails are matched case-insensitively so "Name@Thapar.edu" still logs in.
        match = User.objects.filter(email__iexact=email).first()
        user = authenticate(
            username=match.email if match else email,
            password=attrs["password"],
        )
        if not user:
            if match and not match.is_active:
                raise serializers.ValidationError("This account is inactive.")
            raise serializers.ValidationError("Invalid email or password.")
        attrs["user"] = user
        return attrs
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "phone", "role", "created_at"]
        read_only_fields = ["id", "email", "role", "created_at"]
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is wrong.")
        return value
````

## File: backend/accounts/urls.py
````python
from django.urls import path
from .views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
    RegisterView,
)
urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("password/", ChangePasswordView.as_view()),
]
````

## File: backend/accounts/views.py
````python
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
def _tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = serializer.save()
        return Response(
            {
                "success": True,
                "message": "Account created successfully.",
                "user": UserSerializer(user).data,
                **_tokens(user),
            },
            status=status.HTTP_201_CREATED,
        )
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        user = serializer.validated_data["user"]
        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "user": UserSerializer(user).data,
                **_tokens(user),
            }
        )
class RefreshView(APIView):
    """Swap a refresh token for a fresh access token."""
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        raw = request.data.get("refresh")
        if not raw:
            return Response(
                {"success": False, "message": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            refresh = RefreshToken(raw)  # also rejects blacklisted tokens
        except TokenError:
            return Response(
                {"success": False, "message": "Session expired. Please sign in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response({"success": True, "access": str(refresh.access_token)})
class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({"success": True, "user": UserSerializer(request.user).data})
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        return Response({"success": True, "user": serializer.data})
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"success": True, "message": "Password updated."})
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            # Already invalid - the user is logged out either way.
            pass
        return Response({"success": True, "message": "Logged out successfully."})
````

## File: backend/authorizations/migrations/__init__.py
````python

````

## File: backend/authorizations/__init__.py
````python

````

## File: backend/authorizations/admin.py
````python
from django.contrib import admin
# Register your models here.
````

## File: backend/authorizations/apps.py
````python
from django.apps import AppConfig
class AuthorizationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authorizations'
````

## File: backend/authorizations/models.py
````python
from django.db import models
# Create your models here.
````

## File: backend/authorizations/views.py
````python
from django.shortcuts import render
# Create your views here.
````

## File: backend/bookings/migrations/__init__.py
````python

````

## File: backend/bookings/migrations/0001_initial.py
````python
# Generated by Django 6.1.3 on 2026-11-22 15:42
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("parking", "0001_initial"),
        ("vehicles", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name="Booking",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("plate_number", models.CharField(db_index=True, max_length=20)),
                ("vehicle_type", models.CharField(max_length=20)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("RESERVED", "Reserved"),
                            ("ACTIVE", "Parked"),
                            ("COMPLETED", "Completed"),
                            ("CANCELLED", "Cancelled"),
                            ("EXPIRED", "Expired"),
                        ],
                        db_index=True,
                        default="RESERVED",
                        max_length=20,
                    ),
                ),
                ("is_walk_in", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("checked_in_at", models.DateTimeField(blank=True, null=True)),
                ("checked_out_at", models.DateTimeField(blank=True, null=True)),
                ("cancelled_at", models.DateTimeField(blank=True, null=True)),
                (
                    "slot",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="bookings",
                        to="parking.parkingslot",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="bookings",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "vehicle",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="bookings",
                        to="vehicles.vehicle",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "constraints": [
                    models.UniqueConstraint(
                        condition=models.Q(("status__in", ["RESERVED", "ACTIVE"])),
                        fields=("slot",),
                        name="one_open_booking_per_slot",
                    ),
                    models.UniqueConstraint(
                        condition=models.Q(("status__in", ["RESERVED", "ACTIVE"])),
                        fields=("plate_number",),
                        name="one_open_booking_per_plate",
                    ),
                ],
            },
        ),
    ]
````

## File: backend/bookings/__init__.py
````python

````

## File: backend/bookings/admin.py
````python
from django.contrib import admin
from .models import Booking
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["plate_number", "status", "slot", "user", "is_walk_in", "created_at", "checked_in_at", "checked_out_at"]
    list_filter = ["status", "is_walk_in", "slot__lot", "vehicle_type"]
    search_fields = ["plate_number", "user__email", "user__name"]
    raw_id_fields = ["user", "vehicle", "slot"]
    date_hierarchy = "created_at"
````

## File: backend/bookings/apps.py
````python
from django.apps import AppConfig
class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bookings'
````

## File: backend/bookings/models.py
````python
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone
class Booking(models.Model):
    """One visit to a slot: reserved in the app (or a walk-in at the gate),
    then checked in and out by a guard."""
    class Status(models.TextChoices):
        RESERVED = "RESERVED", "Reserved"
        ACTIVE = "ACTIVE", "Parked"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        EXPIRED = "EXPIRED", "Expired"
    OPEN = (Status.RESERVED, Status.ACTIVE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )
    vehicle = models.ForeignKey(
        "vehicles.Vehicle", on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings"
    )
    # Snapshot so history survives if the vehicle is deleted, and so walk-ins
    # without a registered vehicle can still be tracked.
    plate_number = models.CharField(max_length=20, db_index=True)
    vehicle_type = models.CharField(max_length=20)
    slot = models.ForeignKey("parking.ParkingSlot", on_delete=models.PROTECT, related_name="bookings")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RESERVED, db_index=True)
    is_walk_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # A slot can only hold one open booking, and a plate can only be in one place.
            models.UniqueConstraint(
                fields=["slot"], condition=Q(status__in=["RESERVED", "ACTIVE"]), name="one_open_booking_per_slot"
            ),
            models.UniqueConstraint(
                fields=["plate_number"],
                condition=Q(status__in=["RESERVED", "ACTIVE"]),
                name="one_open_booking_per_plate",
            ),
        ]
    def __str__(self):
        return f"{self.plate_number} @ {self.slot} [{self.status}]"
    # --- helpers -----------------------------------------------------------
    @classmethod
    def expire_stale(cls):
        """Release reservations whose hold time ran out. Called lazily before
        any read/write that depends on availability (no background worker needed)."""
        return cls.objects.filter(status=cls.Status.RESERVED, expires_at__lt=timezone.now()).update(
            status=cls.Status.EXPIRED
        )
    @classmethod
    def open_qs(cls):
        cls.expire_stale()
        return cls.objects.filter(status__in=cls.OPEN)
    @classmethod
    def open_for_vehicle(cls, vehicle):
        return cls.open_qs().filter(vehicle=vehicle).first()
    @classmethod
    def new_expiry(cls):
        return timezone.now() + timedelta(minutes=settings.RESERVATION_MINUTES)
````

## File: backend/bookings/serializers.py
````python
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
````

## File: backend/bookings/tests.py
````python
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
````

## File: backend/bookings/urls.py
````python
from django.urls import path
from . import views
urlpatterns = [
    path("", views.bookings),
    path("current/", views.current),
    path("<int:pk>/cancel/", views.cancel),
]
````

## File: backend/bookings/views.py
````python
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
````

## File: backend/config/__init__.py
````python

````

## File: backend/config/asgi.py
````python
"""
ASGI config for config project.
It exposes the ASGI callable as a module-level variable named ``application``.
For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""
import os
from django.core.asgi import get_asgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_asgi_application()
````

## File: backend/config/settings.py
````python
"""
Django settings for config project.
Generated by 'django-admin startproject' using Django 5.0.6.
For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""
import os
from datetime import timedelta
from pathlib import Path
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/
# SECURITY WARNING: keep the secret key used in production secret!
# Set DJANGO_SECRET_KEY / DJANGO_DEBUG in the environment for anything beyond local dev.
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    'django-insecure-v&*264qj5$#lizjufeu$_+kfa+2)0$^fh^d-@@s*h^k5&g6lh*',
)
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
# "*" keeps ngrok links working without editing settings every time the link changes.
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")
# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    "rest_framework_simplejwt.token_blacklist",
    'accounts',
    'vehicles',
    'parking',
    'bookings',
    'authorizations',
    'gate',
    'notifications',
    'dashboard',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'config.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'config.wsgi.application'
# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/
STATIC_URL = 'static/'
# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
CORS_ALLOW_ALL_ORIGINS = True
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
SIMPLE_JWT = {
    # The app refreshes the access token automatically when it expires.
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
}
# How long a reserved slot is held before it is released if the car never arrives.
RESERVATION_MINUTES = int(os.environ.get("RESERVATION_MINUTES", "30"))
AUTH_USER_MODEL = "accounts.User"
````

## File: backend/config/urls.py
````python
from django.contrib import admin
from django.urls import include, path
admin.site.site_header = "Thapar Parking admin"
admin.site.site_title = "Thapar Parking"
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/vehicles/", include("vehicles.urls")),
    path("api/parking/", include("parking.urls")),
    path("api/bookings/", include("bookings.urls")),
    path("api/gate/", include("gate.urls")),
]
````

## File: backend/config/wsgi.py
````python
"""
WSGI config for config project.
It exposes the WSGI callable as a module-level variable named ``application``.
For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""
import os
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()
````

## File: backend/dashboard/migrations/__init__.py
````python

````

## File: backend/dashboard/__init__.py
````python

````

## File: backend/dashboard/admin.py
````python
from django.contrib import admin
# Register your models here.
````

## File: backend/dashboard/apps.py
````python
from django.apps import AppConfig
class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'
````

## File: backend/dashboard/models.py
````python
from django.db import models
# Create your models here.
````

## File: backend/dashboard/urls.py
````python
from django.urls import path
from .views import health_check, stats
urlpatterns = [
    path("health/", health_check),
    path("stats/", stats),
]
````

## File: backend/dashboard/views.py
````python
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
````

## File: backend/gate/migrations/__init__.py
````python

````

## File: backend/gate/migrations/0001_initial.py
````python
# Generated by Django 6.1.3 on 2026-11-22 15:42
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("bookings", "0001_initial"),
        ("parking", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name="GateEvent",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "kind",
                    models.CharField(
                        choices=[("ENTRY", "Entry"), ("EXIT", "Exit")], max_length=10
                    ),
                ),
                ("plate_number", models.CharField(max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "booking",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="gate_events",
                        to="bookings.booking",
                    ),
                ),
                (
                    "guard",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="gate_events",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "lot",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="gate_events",
                        to="parking.parkinglot",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
````

## File: backend/gate/__init__.py
````python

````

## File: backend/gate/admin.py
````python
from django.contrib import admin
from .models import GateEvent
@admin.register(GateEvent)
class GateEventAdmin(admin.ModelAdmin):
    list_display = ["created_at", "kind", "plate_number", "lot", "guard"]
    list_filter = ["kind", "lot"]
    search_fields = ["plate_number"]
    date_hierarchy = "created_at"
````

## File: backend/gate/apps.py
````python
from django.apps import AppConfig
class GateConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gate'
````

## File: backend/gate/models.py
````python
from django.conf import settings
from django.db import models
class GateEvent(models.Model):
    class Kind(models.TextChoices):
        ENTRY = "ENTRY", "Entry"
        EXIT = "EXIT", "Exit"
    kind = models.CharField(max_length=10, choices=Kind.choices)
    booking = models.ForeignKey("bookings.Booking", on_delete=models.CASCADE, related_name="gate_events")
    plate_number = models.CharField(max_length=20)
    lot = models.ForeignKey("parking.ParkingLot", on_delete=models.CASCADE, related_name="gate_events")
    guard = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="gate_events"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    class Meta:
        ordering = ["-created_at"]
    def __str__(self):
        return f"{self.kind} {self.plate_number} @ {self.lot.code}"
````

## File: backend/gate/urls.py
````python
from django.urls import path
from . import views
urlpatterns = [
    path("lookup/", views.lookup),
    path("check-in/", views.check_in),
    path("check-out/", views.check_out),
    path("events/", views.events),
    path("inside/", views.inside),
]
````

## File: backend/gate/views.py
````python
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
````

## File: backend/notifications/migrations/__init__.py
````python

````

## File: backend/notifications/__init__.py
````python

````

## File: backend/notifications/admin.py
````python
from django.contrib import admin
# Register your models here.
````

## File: backend/notifications/apps.py
````python
from django.apps import AppConfig
class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
````

## File: backend/notifications/models.py
````python
from django.db import models
# Create your models here.
````

## File: backend/notifications/views.py
````python
from django.shortcuts import render
# Create your views here.
````

## File: backend/parking/management/commands/__init__.py
````python

````

## File: backend/parking/management/commands/seed_parking.py
````python
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
````

## File: backend/parking/management/__init__.py
````python

````

## File: backend/parking/migrations/__init__.py
````python

````

## File: backend/parking/migrations/0001_initial.py
````python
# Generated by Django 6.1.3 on 2026-11-22 15:42
import django.db.models.deletion
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="ParkingLot",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "code",
                    models.SlugField(
                        help_text="Short id used by the app, e.g. main-gate",
                        unique=True,
                    ),
                ),
                ("name", models.CharField(max_length=120)),
                (
                    "zone",
                    models.CharField(
                        choices=[
                            ("A", "Zone A"),
                            ("B", "Zone B"),
                            ("C", "Zone C"),
                            ("D", "Zone D"),
                        ],
                        max_length=1,
                    ),
                ),
                ("area", models.CharField(blank=True, max_length=120)),
                ("lat", models.FloatField()),
                ("lng", models.FloatField()),
                (
                    "floors",
                    models.JSONField(
                        default=list,
                        help_text='Floor names in display order, e.g. ["Ground", "1st"]',
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["zone", "name"],
            },
        ),
        migrations.CreateModel(
            name="ParkingSlot",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("floor", models.CharField(max_length=30)),
                ("floor_index", models.PositiveSmallIntegerField(default=0)),
                ("number", models.PositiveIntegerField()),
                (
                    "vehicle_type",
                    models.CharField(
                        choices=[
                            ("CAR", "Car"),
                            ("BIKE", "Bike"),
                            ("SCOOTER", "Scooter"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Untick to block a slot (repairs, reserved for staff, ...)",
                    ),
                ),
                (
                    "lot",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="slots",
                        to="parking.parkinglot",
                    ),
                ),
            ],
            options={
                "ordering": ["lot", "floor_index", "vehicle_type", "number"],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("lot", "floor", "vehicle_type", "number"),
                        name="unique_slot_per_lot_floor_type",
                    )
                ],
            },
        ),
    ]
````

## File: backend/parking/__init__.py
````python

````

## File: backend/parking/admin.py
````python
from django.contrib import admin
from .models import ParkingLot, ParkingSlot
class SlotInline(admin.TabularInline):
    model = ParkingSlot
    extra = 0
    fields = ["floor", "floor_index", "vehicle_type", "number", "is_active"]
@admin.register(ParkingLot)
class ParkingLotAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "zone", "area", "is_active"]
    list_filter = ["zone", "is_active"]
    prepopulated_fields = {"code": ("name",)}
    inlines = [SlotInline]
@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = ["__str__", "lot", "floor", "vehicle_type", "number", "is_active"]
    list_filter = ["lot", "vehicle_type", "floor", "is_active"]
    list_editable = ["is_active"]
````

## File: backend/parking/apps.py
````python
from django.apps import AppConfig
class ParkingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'parking'
````

## File: backend/parking/models.py
````python
from django.db import models
class VehicleType(models.TextChoices):
    CAR = "CAR", "Car"
    BIKE = "BIKE", "Bike"
    SCOOTER = "SCOOTER", "Scooter"
class ParkingLot(models.Model):
    class Zone(models.TextChoices):
        A = "A", "Zone A"
        B = "B", "Zone B"
        C = "C", "Zone C"
        D = "D", "Zone D"
    code = models.SlugField(max_length=50, unique=True, help_text="Short id used by the app, e.g. main-gate")
    name = models.CharField(max_length=120)
    zone = models.CharField(max_length=1, choices=Zone.choices)
    area = models.CharField(max_length=120, blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    floors = models.JSONField(default=list, help_text='Floor names in display order, e.g. ["Ground", "1st"]')
    is_active = models.BooleanField(default=True)
    class Meta:
        ordering = ["zone", "name"]
    def __str__(self):
        return f"{self.name} (Zone {self.zone})"
class ParkingSlot(models.Model):
    lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name="slots")
    floor = models.CharField(max_length=30)
    floor_index = models.PositiveSmallIntegerField(default=0)
    number = models.PositiveIntegerField()
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices)
    is_active = models.BooleanField(default=True, help_text="Untick to block a slot (repairs, reserved for staff, ...)")
    class Meta:
        ordering = ["lot", "floor_index", "vehicle_type", "number"]
        constraints = [
            models.UniqueConstraint(
                fields=["lot", "floor", "vehicle_type", "number"],
                name="unique_slot_per_lot_floor_type",
            )
        ]
    @property
    def label(self):
        prefix = {"CAR": "C", "BIKE": "B", "SCOOTER": "S"}.get(self.vehicle_type, "")
        return f"{prefix}{self.number:02d}"
    def __str__(self):
        return f"{self.lot.code} / {self.floor} / {self.label}"
````

## File: backend/parking/serializers.py
````python
from rest_framework import serializers
from .models import ParkingLot
class LotSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code")
    capacity = serializers.SerializerMethodField()
    free = serializers.SerializerMethodField()
    class Meta:
        model = ParkingLot
        fields = ["id", "name", "zone", "area", "lat", "lng", "floors", "capacity", "free"]
    def _avail(self, obj):
        return self.context["availability"][obj.id]
    def get_capacity(self, obj):
        return self._avail(obj)["capacity"]
    def get_free(self, obj):
        return self._avail(obj)["free"]
class LotBriefSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code")
    class Meta:
        model = ParkingLot
        fields = ["id", "name", "zone", "area", "lat", "lng"]
````

## File: backend/parking/services.py
````python
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
````

## File: backend/parking/urls.py
````python
from django.urls import path
from . import views
urlpatterns = [
    path("lots/", views.lot_list),
    path("lots/<slug:code>/", views.lot_detail),
    path("lots/<slug:code>/slots/", views.lot_slots),
]
````

## File: backend/parking/views.py
````python
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
````

## File: backend/vehicles/migrations/__init__.py
````python

````

## File: backend/vehicles/migrations/0001_initial.py
````python
# Generated by Django 5.2.17 on 2026-09-20 06:57
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plate_number', models.CharField(max_length=20, unique=True)),
                ('vehicle_type', models.CharField(choices=[('CAR', 'Car'), ('BIKE', 'Bike'), ('SCOOTER', 'Scooter')], max_length=20)),
                ('make', models.CharField(blank=True, max_length=100)),
                ('model', models.CharField(blank=True, max_length=100)),
                ('color', models.CharField(blank=True, max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicles', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
````

## File: backend/vehicles/__init__.py
````python

````

## File: backend/vehicles/admin.py
````python
from django.contrib import admin
from .models import Vehicle
@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ["plate_number", "vehicle_type", "owner", "make", "model", "color", "created_at"]
    list_filter = ["vehicle_type"]
    search_fields = ["plate_number", "owner__email", "owner__name"]
````

## File: backend/vehicles/apps.py
````python
from django.apps import AppConfig
class VehiclesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vehicles'
````

## File: backend/vehicles/models.py
````python
from django.db import models
from django.conf import settings
class Vehicle(models.Model):
    class VehicleType(models.TextChoices):
        CAR = "CAR", "Car"
        BIKE = "BIKE", "Bike"
        SCOOTER = "SCOOTER", "Scooter"
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vehicles"
    )
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices
    )
    make = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.plate_number} - {self.owner.email}"
````

## File: backend/vehicles/serializers.py
````python
import re
from rest_framework import serializers
from .models import Vehicle
def normalize_plate(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", (value or "").upper())
class VehicleSerializer(serializers.ModelSerializer):
    # Declared explicitly so uniqueness is checked on the *normalised* plate
    # ("pb 11 ab 1234" and "PB11AB1234" are the same vehicle).
    plate_number = serializers.CharField(max_length=20)
    class Meta:
        model = Vehicle
        fields = ["id", "plate_number", "vehicle_type", "make", "model", "color", "created_at"]
        read_only_fields = ["id", "created_at"]
    def validate_plate_number(self, value):
        plate = normalize_plate(value)
        if len(plate) < 4:
            raise serializers.ValidationError("Enter a valid vehicle number.")
        qs = Vehicle.objects.filter(plate_number=plate)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This vehicle is already registered.")
        return plate
````

## File: backend/vehicles/urls.py
````python
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet
router = DefaultRouter()
router.register("", VehicleViewSet, basename="vehicle")
urlpatterns = router.urls
````

## File: backend/vehicles/views.py
````python
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
````

## File: backend/.gitignore
````
venv/
.venv/
__pycache__/
*.pyc
.DS_Store
````

## File: backend/manage.py
````python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
if __name__ == '__main__':
    main()
````

## File: backend/README.md
````markdown
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
````

## File: backend/requirements.txt
````
Django>=5.0,<6.1
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
````
