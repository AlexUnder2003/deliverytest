from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import DeliveryViewSet

router = DefaultRouter()
router.register("deliveries", DeliveryViewSet, basename="delivery")

urlpatterns = [
    path("", include(router.urls)),
]
