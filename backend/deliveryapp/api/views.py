from rest_framework import viewsets

from delivery.models import Delivery
from api.models import (
    TechStatus,
    PackagingType,
    Service,
    DeliveryStatus,
    CargoType,
    TransportModel,
)
from api.serializers import (
    DeliveryWriteSerializer,
    DeliveryReadSerializer,
    TechStatusSerializer,
    PackagingTypeSerializer,
    ServiceSerializer,
    DeliveryStatusSerializer,
    TransportModelSerializer,
)


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()

    def get_serializer_class(self):
        return (
            DeliveryWriteSerializer
            if self.action in ("create", "update", "partial_update")
            else DeliveryReadSerializer
        )


class TechStatusViewSet(viewsets.ModelViewSet):
    queryset = TechStatus.objects.all()
    serializer_class = TechStatusSerializer


class PackagingTypeViewSet(viewsets.ModelViewSet):
    queryset = PackagingType.objects.all()
    serializer_class = PackagingTypeSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class DeliveryStatusViewSet(viewsets.ModelViewSet):
    queryset = DeliveryStatus.objects.all()
    serializer_class = DeliveryStatusSerializer


class TransportModelViewSet(viewsets.ModelViewSet):
    queryset = TransportModel.objects.all()
    serializer_class = TransportModelSerializer
