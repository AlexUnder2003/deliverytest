from django.db import models

from api.constants import BASE_NAME_LENGTH


class ReferenceBase(models.Model):
    name = models.CharField("Название", max_length=BASE_NAME_LENGTH)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class TechStatus(ReferenceBase):
    class Meta:
        verbose_name = "Техническое состояние"
        verbose_name_plural = "Технические состояния"


class PackagingType(ReferenceBase):
    class Meta:
        verbose_name = "Тип упаковки"
        verbose_name_plural = "Типы упаковки"


class Service(ReferenceBase):
    class Meta:
        verbose_name = "Услуга"
        verbose_name_plural = "Услуги"


class DeliveryStatus(ReferenceBase):
    class Meta:
        verbose_name = "Статус доставки"
        verbose_name_plural = "Статусы доставки"


class TransportModel(models.Model):
    number = models.CharField("Номер транспорта", max_length=BASE_NAME_LENGTH)

    def __str__(self):
        return self.number
