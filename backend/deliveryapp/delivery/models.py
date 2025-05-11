# models.py in app `deliveries`
from django.db import models
from api.models import (
    TransportModel,
    PackagingType,
    Service,
    DeliveryStatus,
    CargoType,
    TechStatus,
)


class Delivery(models.Model):
    """
    Модель доставки, соответствующая форме создания.
    """

    # Курьерский транспорт
    transport_model = models.ForeignKey(
        TransportModel,
        verbose_name="Модель транспорта",
        on_delete=models.PROTECT,
        related_name="deliveries",
    )
    transport_number = models.CharField("Номер транспорта", max_length=100)

    # Время отправки и доставки
    dispatch_datetime = models.DateTimeField("Дата и время отправки")
    delivery_datetime = models.DateTimeField("Дата и время доставки")

    # Дистанция
    distance = models.CharField("Дистанция", max_length=50)

    # Услуги (несколько)
    service = models.ForeignKey(
        Service,
        verbose_name="Услуги",
        related_name="deliveries",
        on_delete=models.SET_NULL,
        null=True,  # Add this line to fix the error
    )

    # Тип упаковки
    packaging = models.ForeignKey(
        PackagingType,
        verbose_name="Тип упаковки",
        on_delete=models.SET_NULL,
        null=True,
        related_name="deliveries",
    )

    # Статус доставки
    status = models.ForeignKey(
        DeliveryStatus,
        verbose_name="Статус доставки",
        on_delete=models.PROTECT,
        related_name="deliveries",
    )

    # Техническое состояние транспорта
    technical_condition = models.ForeignKey(
        TechStatus,
        verbose_name="Техническое состояние",
        on_delete=models.PROTECT,
        related_name="deliveries",
    )

    # Сборщик (ФИО)
    collector = models.CharField("Сборщик (ФИО)", max_length=200, blank=True)

    # Комментарий
    comment = models.TextField("Комментарий", blank=True)

    # Тип груза
    cargo_type = models.ForeignKey(
        CargoType,
        verbose_name="Тип груза",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deliveries",
    )

    # Вложения (если необходима простая реализация)
    attachments = models.FileField(
        "Вложения",
        upload_to="deliveries/files/",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Доставка"
        verbose_name_plural = "Доставки"
        ordering = ["-dispatch_datetime"]

    def __str__(self):
        return (
            f"Доставка #{self.pk} — "
            f"{self.transport_model} №{self.transport_number}"
        )
