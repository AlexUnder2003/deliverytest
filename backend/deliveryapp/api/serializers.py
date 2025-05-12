from rest_framework import serializers

from delivery.models import Delivery
from api.models import (
    TechStatus,
    PackagingType,
    Service,
    DeliveryStatus,
    TransportModel,
)


class TechStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechStatus
        fields = "__all__"


class PackagingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackagingType
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class DeliveryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryStatus
        fields = "__all__"


class TransportModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportModel
        fields = "__all__"


class DeliveryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = "__all__"


class DeliveryReadSerializer(serializers.ModelSerializer):
    transport_model = TransportModelSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    packaging = PackagingTypeSerializer(read_only=True)
    status = DeliveryStatusSerializer(read_only=True)
    technical_condition = TechStatusSerializer(read_only=True)

    class Meta:
        model = Delivery
        fields = "__all__"
