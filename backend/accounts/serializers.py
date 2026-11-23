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
