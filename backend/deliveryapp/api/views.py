from rest_framework import viewsets
from django_filters import rest_framework as filters
from django_filters.rest_framework import (
    DjangoFilterBackend,
    FilterSet,
    DateFilter,
    ModelChoiceFilter,
)

from delivery.models import Delivery
from api.models import (
    TechStatus,
    PackagingType,
    Service,
    DeliveryStatus,
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


class DeliveryFilter(filters.FilterSet):
    start_date = filters.DateFilter(
        field_name="delivery_datetime", lookup_expr="gte"
    )
    end_date = filters.DateFilter(
        field_name="delivery_datetime", lookup_expr="lte"
    )
    service = filters.ModelChoiceFilter(queryset=Service.objects.all())

    class Meta:
        model = Delivery
        fields = ["start_date", "end_date", "service"]


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = DeliveryFilter

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
