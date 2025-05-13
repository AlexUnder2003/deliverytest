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
        "dispatch_datetime",
        "distance",
        "service",
        "status",
        "technical_condition",
    )
    list_filter = (
        "dispatch_datetime",
        "service",
        "status",
        "technical_condition",
    )
    search_fields = ("id", "transport_model__number")
    date_hierarchy = "dispatch_datetime"


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
    list_display = ("id", "number")
    search_fields = ("number",)
