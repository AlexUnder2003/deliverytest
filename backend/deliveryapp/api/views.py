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
    DeliverySerializer,
    TechStatusSerializer,
    PackagingTypeSerializer,
    ServiceSerializer,
    DeliveryStatusSerializer,
    CargoTypeSerializer,
    TransportModelSerializer,
)


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer


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


class CargoTypeViewSet(viewsets.ModelViewSet):
    queryset = CargoType.objects.all()
    serializer_class = CargoTypeSerializer


class TransportModelViewSet(viewsets.ModelViewSet):
    queryset = TransportModel.objects.all()
    serializer_class = TransportModelSerializer
