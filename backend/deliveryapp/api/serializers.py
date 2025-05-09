from rest_framework import serializers

from delivery.models import Delivery
from api.models import (
    TechStatus,
    PackagingType,
    Service,
    DeliveryStatus,
    CargoType,
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


class CargoTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CargoType
        fields = "__all__"


class TransportModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportModel
        fields = "__all__"


class DeliverySerializer(serializers.ModelSerializer):
    transport_model = TransportModelSerializer(read_only=True)
    transport_model_id = serializers.PrimaryKeyRelatedField(
        queryset=TransportModel.objects.all(),
        source="transport_model",
        write_only=True,
    )

    services = ServiceSerializer(many=True, read_only=True)
    services_ids = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        source="services",
        write_only=True,
        many=True,
        required=False,
    )

    packaging = PackagingTypeSerializer(read_only=True)
    packaging_id = serializers.PrimaryKeyRelatedField(
        queryset=PackagingType.objects.all(),
        source="packaging",
        write_only=True,
        required=False,
        allow_null=True,
    )

    status = DeliveryStatusSerializer(read_only=True)
    status_id = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryStatus.objects.all(), source="status", write_only=True
    )

    technical_condition = TechStatusSerializer(read_only=True)
    technical_condition_id = serializers.PrimaryKeyRelatedField(
        queryset=TechStatus.objects.all(),
        source="technical_condition",
        write_only=True,
    )

    cargo_type = CargoTypeSerializer(read_only=True)
    cargo_type_id = serializers.PrimaryKeyRelatedField(
        queryset=CargoType.objects.all(),
        source="cargo_type",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Delivery
        fields = [
            "id",
            "transport_model",
            "transport_model_id",
            "transport_number",
            "dispatch_datetime",
            "delivery_datetime",
            "distance",
            "services",
            "services_ids",
            "packaging",
            "packaging_id",
            "status",
            "status_id",
            "technical_condition",
            "technical_condition_id",
            "collector",
            "comment",
            "cargo_type",
            "cargo_type_id",
            "attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")
        extra_kwargs = {
            "dispatch_datetime": {
                "format": "%Y-%m-%dT%H:%M:%SZ",
                "input_formats": ["iso-8601"],
            },
            "delivery_datetime": {
                "format": "%Y-%m-%dT%H:%M:%SZ",
                "input_formats": ["iso-8601"],
            },
        }
