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
