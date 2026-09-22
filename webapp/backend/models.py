from django.db import models
from django.utils import timezone

from .constants import *


class Dispatcher(models.Model):
    username = models.CharField(max_length=10)
    password = models.CharField(max_length=40)

    def __str__(self):
        return self.username


class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.name} ({self.id})"


class Customer(models.Model):
    username = models.CharField(max_length=10)
    password = models.CharField(max_length=40)

    name = models.CharField(max_length=100)
    phone = models.BigIntegerField(default=0)
    email = models.EmailField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.id})"


class Rider(models.Model):
    name = models.CharField(max_length=100)
    phone = models.BigIntegerField(default=0)
    email = models.EmailField(max_length=255)

    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)

    max_capacity = models.IntegerField(default=0)
    is_stuck = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="product_photos/", null=True, blank=True)
    description = models.TextField(max_length=255, blank=True, default="")
    price = models.FloatField(default=0.0)
    weight = models.FloatField(default=0.0)
    qty_in_stock = models.IntegerField(default=0)

    warehouse = models.ForeignKey(Warehouse, related_name="products", on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Order(models.Model):
    product = models.ForeignKey(Product, related_name="orders", on_delete=models.CASCADE)
    rider = models.ForeignKey(Rider, related_name="orders", on_delete=models.CASCADE)

    status = models.CharField(max_length=10, choices=ORDER_STATUSES)
    priority = models.IntegerField(default=0)
    amt_paid = models.FloatField(default=0.0)

    address = models.CharField(max_length=1000, blank=True, default="")
    address_photo = models.ImageField(upload_to="address_photos/", null=True, blank=True)
    dest_lat = models.FloatField(default=0.0)
    dest_lon = models.FloatField(default=0.0)

    def __str__(self):
        return f"Order {self.id}"


class AuditLog(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    text = models.TextField(blank=True, default="")
    level = models.CharField(max_length=100)

    def __str__(self):
        return f"AuditLog {self.timestamp}"