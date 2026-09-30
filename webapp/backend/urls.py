from django.urls import path

from . import views

urlpatterns = [
    # Dispatcher URLs
    path("dispatcher-login/", views.dispatcher_login, name="dispatcher_login"),
    path("dispatcher-current-user/", views.dispatcher_current_user, name="dispatcher_current_user"),

    path("warehouse-list/", views.warehouse_list, name="warehouse_list"),
    path("warehouse-add/", views.warehouse_add, name="warehouse_add"),
    path("warehouse-update/<int:warehouse_id>/", views.warehouse_update, name="warehouse_update"),
    path("warehouse-delete/<int:warehouse_id>/", views.warehouse_delete, name="warehouse_delete"),

    path("rider-list/", views.rider_list, name="rider_list"),
    path("rider-add/", views.rider_add, name="rider_add"),
    path("rider-update/<int:rider_id>/", views.rider_update, name="rider_update"),
    path("rider-delete/<int:rider_id>/", views.rider_delete, name="rider_delete"),

    path("order-list/", views.order_list, name="order_list"),
    path("order-detail/<int:order_id>/", views.order_detail, name="order_detail"),
    path("order-delete/<int:order_id>/", views.order_delete, name="order_delete"),

    path("product-add/", views.product_add, name="product_add"),
    path("product-update/<int:product_id>/", views.product_update, name="product_update"),
    path("product-delete/<int:product_id>/", views.product_delete, name="product_delete"),

    path("get-markers/", views.get_markers, name="get_markers"),
    path("audit-logs/", views.get_audit_logs, name="get_audit_logs"),

    path("customer-list/", views.customer_list, name="customer_list"),

    # Customer URLs
    path("customer-login/", views.customer_login, name="customer_login"),
    path("order-place/", views.order_place, name="order_place"),
    path("customer-order-list/", views.customer_order_list, name="customer_order_list"),

    # URLs who both have access to
    path("product-list/", views.product_list, name="product_list"),
    path("product-detail/<int:product_id>/", views.product_detail, name="product_detail"),
]