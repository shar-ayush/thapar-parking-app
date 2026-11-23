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
