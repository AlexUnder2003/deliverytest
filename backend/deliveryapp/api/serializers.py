from rest_framework import serializers

from delivery.models import Delivery


class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = "__all__"
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
