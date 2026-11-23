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
