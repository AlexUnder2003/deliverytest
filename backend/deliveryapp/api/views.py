from rest_framework import viewsets

from delivery.models import Delivery
from api.serializers import DeliverySerializer


# Create your views here.
class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer
