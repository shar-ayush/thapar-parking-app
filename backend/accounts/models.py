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
