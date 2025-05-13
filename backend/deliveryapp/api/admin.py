from django.contrib import admin
from api.models import (
    TechStatus,
    PackagingType,
    Service,
    DeliveryStatus,
    TransportModel,
)
from delivery.models import Delivery


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "delivery_date",
        "distance",
        "service",
        "status",
        "tech_status",
    )
    list_filter = ("delivery_date", "service", "status", "tech_status")
    search_fields = ("id", "transport_model__name")
    date_hierarchy = "delivery_date"


@admin.register(TechStatus)
class TechStatusAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(PackagingType)
class PackagingTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(DeliveryStatus)
class DeliveryStatusAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(TransportModel)
class TransportModelAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
