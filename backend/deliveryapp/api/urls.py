from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
    DeliveryViewSet,
    TechStatusViewSet,
    PackagingTypeViewSet,
    ServiceViewSet,
    DeliveryStatusViewSet,
    CargoTypeViewSet,
    TransportModelViewSet,
)

router = DefaultRouter()
router.register("deliveries", DeliveryViewSet, basename="deliveries")
router.register("tech-statuses", TechStatusViewSet, basename="tech-status")
router.register(
    "packaging-types", PackagingTypeViewSet, basename="packaging-types"
)
router.register("services", ServiceViewSet, basename="services")
router.register(
    "delivery-statuses", DeliveryStatusViewSet, basename="delivery-statuses"
)
router.register("cargo-types", CargoTypeViewSet, basename="cargo-types")
router.register(
    "transport-models", TransportModelViewSet, basename="transport-models"
)

urlpatterns = [
    path("", include(router.urls)),
]
