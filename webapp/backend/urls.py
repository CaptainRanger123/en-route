from django.urls import path

from . import views

urlpatterns = [
    path("dispatcher-login/", views.dispatcher_login, name="dispatcher_login"),
    path("dispatcher-current-user/", views.dispatcher_current_user, name="dispatcher_current_user"),

    path("warehouse-list/", views.warehouse_list, name="warehouse_list"),
    path("warehouse-add/", views.warehouse_add, name="warehouse_add"),

    path("rider-list/", views.rider_list, name="rider_list"),
    path("rider-add/", views.rider_add, name="rider_add"),

    path("order-list/", views.order_list, name="order_list"),
    path("order-detail/<int:order_id>/", views.order_detail, name="order_detail"),
    # path("order-update/<int:order_id>/", views.order_update, name="order_update"),
    path("order-delete/<int:order_id>/", views.order_delete, name="order_delete"),

    path("customer-login/", views.customer_login, name="customer_login"),
    path("product-list/", views.product_list, name="product_list"),
    path("product-detail/<int:product_id>/", views.product_detail, name="product_detail"),
    path("order-place/", views.order_place, name="order_place"),
    path("customer-order-list/", views.customer_order_list, name="customer_order_list"),

    path("audit-logs/", views.get_audit_logs, name="get_audit_logs"),
]