from django.contrib import admin

from . import models

admin.site.register(models.Dispatcher)
admin.site.register(models.Customer)
admin.site.register(models.Rider)
admin.site.register(models.Product)
admin.site.register(models.Order)
admin.site.register(models.Warehouse)
admin.site.register(models.AuditLog)