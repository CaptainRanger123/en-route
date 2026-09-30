import os
import sys
import jwt
import json
import pytz
import numpy as np
import pandas as pd
import datetime as dt
from django.conf import settings
from django.db.models import Q
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect, csrf_exempt

# Models
from .models import Dispatcher, Customer, Rider, Product, Order, Warehouse, AuditLog

# Constants
from .constants import GST_RATE

# Helpers
from .helpers import get_coords_from_address

env = os.environ.get("EN_ROUTE_ENV")


def payload_from_request(request):
    content_type = request.content_type or ""
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        return request.POST
    return json.loads(request.body)


# Helper function to decorate functions if certain condition is met
def conditional_decorator(dec, condition):
    def decorator(func):
        if not condition:
            # Return the function unchanged, not decorated.
            return func
        return dec(func)
    return decorator


# Helper function to ensure only logged in protected/customer can access the endpoint
def protected(request, user_type, token_sent_in="HEADER"):
    if token_sent_in == "HEADER":
        # Token will be sent in the header in the format: "Authorization: jwt-token <token>"
        token_string = request.headers["Authorization"].split()

        if len(token_string) != 2:
            return JsonResponse({"type": "TokenException", "message": "Invalid Token"}, status=400)

        if token_string[0] != "jwt-token":
            return JsonResponse({"type": "TokenException", "message": "Invalid Token"}, status=400)

        token = bytes(token_string[1], "UTF-8")

    elif token_sent_in == "GET":
        token_string = request.GET.get("access-token", "")
        token = bytes(token_string, "UTF-8")

    try:
        # Using the HS256 algorithm to decode the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms="HS256")
    except (jwt.exceptions.ExpiredSignatureError, jwt.exceptions.InvalidSignatureError, jwt.exceptions.DecodeError):
        return JsonResponse({"type": "TokenException", "message": "Invalid Token"}, status=400)

    # user_type can either be a single type ("dispatcher"/"customer") or a list of
    # allowed types, e.g. ["dispatcher", "customer"], for endpoints shared by both
    allowed_types = [user_type] if isinstance(user_type, str) else list(user_type)

    user = None
    for u_type in allowed_types:
        if u_type == "dispatcher":
            try:
                user = Dispatcher.objects.get(username=payload["username"], password=payload["password"])
                break
            except Dispatcher.DoesNotExist:
                continue

        elif u_type == "customer":
            try:
                user = Customer.objects.get(username=payload["username"], password=payload["password"])
                break
            except Customer.DoesNotExist:
                continue

        else:
            return JsonResponse({"type": "UserException", "message": "Invalid User Type"}, status=400)

    if user is None:
        if allowed_types == ["dispatcher"]:
            return JsonResponse({"type": "UserException", "message": "Invalid Dispatcher Account"}, status=400)
        elif allowed_types == ["customer"]:
            return JsonResponse({"type": "UserException", "message": "Invalid Customer Account"}, status=400)
        else:
            return JsonResponse({"type": "UserException", "message": "Invalid Account"}, status=400)

    return [payload, user]


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def dispatcher_login(request):
    data = json.loads(request.body)

    username = data["username"]
    password = data["password"]

    try:
        Dispatcher.objects.get(username=username, password=password)
    except Dispatcher.DoesNotExist:
        return JsonResponse({"type": "UserException", "message": "Invalid Dispatcher Credentials"})

    # Use the Django SECRET_KEY to sign the JWT token
    key = settings.SECRET_KEY

    # After 5 hours, user is automatically logged out
    payload = {"username": username, "password": password, "exp": dt.datetime.now(pytz.timezone("UTC")) + dt.timedelta(hours=5)}

    # Using the HS256 algorithm to encode the token
    token = jwt.encode(payload, key, algorithm="HS256")

    return JsonResponse({"type": "success", "jwtToken": token, "message": "Logged in !"}, status=200)


@require_http_methods(["GET"])
def dispatcher_current_user(request):
    # View to check if the user is logged in and return the current user
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    user = res[1]
    return JsonResponse({"type": "success", "message": "Valid Dispatcher", "username": user.username.capitalize()})


@require_http_methods(["GET"])
def warehouse_list(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data_to_ret = []
    warehouses = Warehouse.objects.all()

    for warehouse in warehouses:
        data_to_ret.append({
            "id": warehouse.id,
            "name": warehouse.name,
            "latitude": warehouse.latitude,
            "longitude": warehouse.longitude,
        })

    return JsonResponse({"type": "success", "data": data_to_ret})


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def warehouse_add(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data = json.loads(request.body)

    name = data["name"]
    latitude = data["latitude"]
    longitude = data["longitude"]

    warehouse = Warehouse.objects.create(
        name=name,
        latitude=latitude,
        longitude=longitude
    )
    warehouse.save()

    return JsonResponse({"type": "success", "message": "Warehouse Added"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def warehouse_update(request, warehouse_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        warehouse = Warehouse.objects.get(id=warehouse_id)
    except Warehouse.DoesNotExist:
        return JsonResponse({"type": "WarehouseException", "message": "Invalid Warehouse"}, status=400)

    data = json.loads(request.body)

    warehouse.name = data.get("name", warehouse.name)
    warehouse.latitude = float(data.get("latitude", warehouse.latitude))
    warehouse.longitude = float(data.get("longitude", warehouse.longitude))
    warehouse.save()

    return JsonResponse({"type": "success", "message": "Warehouse Updated"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def warehouse_delete(request, warehouse_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        warehouse = Warehouse.objects.get(id=warehouse_id)
    except Warehouse.DoesNotExist:
        return JsonResponse({"type": "WarehouseException", "message": "Invalid Warehouse"}, status=400)

    # Deleting a warehouse would cascade-delete its products (and in turn their orders)
    if warehouse.products.exists():
        return JsonResponse({"type": "WarehouseException", "message": "Cannot delete a warehouse that still has products"}, status=400)

    warehouse.delete()

    return JsonResponse({"type": "success", "message": "Warehouse Deleted"}, status=200)


@require_http_methods(["GET"])
def rider_list(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data_to_ret = []
    riders = Rider.objects.all()
    for rider in riders:
        data_to_ret.append({
            "id": rider.id,
            "name": rider.name,
            "phone": rider.phone,
            "email": rider.email,
            "latitude": rider.latitude,
            "longitude": rider.longitude,
            "max_capacity": rider.max_capacity,
            "is_stuck": rider.is_stuck,
            "status": rider.status,
        })

    return JsonResponse({"type": "success", "data": data_to_ret})


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def rider_add(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data = json.loads(request.body)

    name = data["name"]
    phone = data["phone"]
    email = data["email"]

    start_warehouse = Warehouse.objects.get(id=int(data["warehouse_id"]))
    lat = start_warehouse.latitude
    long = start_warehouse.longitude

    max_cap = int(data["max_cap"])

    rider = Rider.objects.create(
        name=name,
        phone=phone,
        email=email,

        latitude=lat,
        longitude=long,

        max_capacity=max_cap,
        is_stuck=False
    )
    rider.save()

    return JsonResponse({"type": "success", "message": "Rider Added"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["PUT"])
def rider_update(request, rider_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        rider = Rider.objects.get(id=rider_id)
    except Rider.DoesNotExist:
        return JsonResponse({"type": "RiderException", "message": "Invalid Rider"}, status=400)

    data = json.loads(request.body)

    rider.name = data.get("name", rider.name)
    rider.phone = data.get("phone", rider.phone)
    rider.email = data.get("email", rider.email)
    rider.max_capacity = int(data.get("max_cap", rider.max_capacity))
    rider.is_stuck = bool(data.get("is_stuck", rider.is_stuck))
    rider.status = data.get("status", rider.status)

    if "latitude" in data:
        rider.latitude = float(data["latitude"])
    if "longitude" in data:
        rider.longitude = float(data["longitude"])

    rider.save()

    return JsonResponse({"type": "success", "message": "Rider Updated"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def rider_delete(request, rider_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        rider = Rider.objects.get(id=rider_id)
    except Rider.DoesNotExist:
        return JsonResponse({"type": "RiderException", "message": "Invalid Rider"}, status=400)

    # Deleting a rider would cascade-delete any orders assigned to them
    if rider.orders.exists():
        return JsonResponse({"type": "RiderException", "message": "Cannot delete a rider with assigned orders"}, status=400)

    rider.delete()

    return JsonResponse({"type": "success", "message": "Rider Deleted"}, status=200)


# Helper to consistently serialize a Product, including its GST-inclusive price,
# for both the dispatcher (inventory management) and customer (browsing) views
def serialize_product(request, product):
    price_with_gst = round(product.price * (1 + GST_RATE), 2)

    return {
        "id": product.id,
        "name": product.name,
        "photo": request.build_absolute_uri(product.photo.url) if product.photo else None,
        "description": product.description,

        "price": product.price,
        "gst_rate": GST_RATE,
        "gst_amount": round(price_with_gst - product.price, 2),
        "price_with_gst": price_with_gst,

        "weight": product.weight,
        "qty_in_stock": product.qty_in_stock,
        "warehouse_id": product.warehouse.id,
        "warehouse_name": product.warehouse.name,
    }


# Product list is shared by dispatchers (inventory management) and customers (browsing to order)
@require_http_methods(["GET"])
def product_list(request):
    res = protected(request, ["dispatcher", "customer"])

    if isinstance(res, JsonResponse):
        return res

    data_to_ret = []
    products = Product.objects.all()

    for product in products:
        data_to_ret.append(serialize_product(request, product))

    return JsonResponse({"type": "success", "data": data_to_ret})


@require_http_methods(["GET"])
def product_detail(request, product_id):
    res = protected(request, ["dispatcher", "customer"])

    if isinstance(res, JsonResponse):
        return res

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"type": "ProductException", "message": "Invalid Product"}, status=400)

    return JsonResponse({"type": "success", "data": serialize_product(request, product)})


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def product_add(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data = payload_from_request(request)

    name = data["name"]
    description = data.get("description", "")
    price = float(data["price"])
    weight = float(data["weight"])
    qty_in_stock = int(data["qty_in_stock"])

    warehouse = Warehouse.objects.get(id=int(data["warehouse_id"]))

    product = Product.objects.create(
        name=name,
        description=description,
        price=price,
        weight=weight,
        qty_in_stock=qty_in_stock,
        warehouse=warehouse,
        photo=request.FILES.get("photo")
    )
    product.save()

    return JsonResponse({"type": "success", "message": "Product Added", "product_id": product.id}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST", "PUT"])
def product_update(request, product_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"type": "ProductException", "message": "Invalid Product"}, status=400)

    data = payload_from_request(request)

    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = float(data.get("price", product.price))
    product.weight = float(data.get("weight", product.weight))
    product.qty_in_stock = int(data.get("qty_in_stock", product.qty_in_stock))

    if "warehouse_id" in data:
        product.warehouse = Warehouse.objects.get(id=int(data["warehouse_id"]))

    photo = request.FILES.get("photo")
    if photo:
        product.photo = photo

    product.save()

    return JsonResponse({"type": "success", "message": "Product Updated"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def product_delete(request, product_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"type": "ProductException", "message": "Invalid Product"}, status=400)

    # Deleting a product would cascade-delete any orders placed for it
    if product.orders.exists():
        return JsonResponse({"type": "ProductException", "message": "Cannot delete a product with existing orders"}, status=400)

    product.delete()

    return JsonResponse({"type": "success", "message": "Product Deleted"}, status=200)


@require_http_methods(["GET"])
def order_list(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data_to_ret = []
    orders = Order.objects.all()

    for order in orders:
        data_to_ret.append({
            "id": order.id,
            "customer_name": order.customer.name,
            "product_name": order.product.name,
            "rider_name": order.rider.name if order.rider else None,
            "status": order.status,
            "priority": order.priority,
            "amt_paid": order.amt_paid,
        })

    return JsonResponse({"type": "success", "data": data_to_ret})


@require_http_methods(["GET"])
def order_detail(request, order_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return JsonResponse({"type": "OrderException", "message": "Invalid Order"}, status=400)

    data_to_ret = {
        "id": order.id,

        "product": {
            "id": order.product.id,
            "name": order.product.name,
            "price": order.product.price,
            "weight": order.product.weight,
        },

        "customer": {
            "id": order.customer.id,
            "name": order.customer.name,
            "phone": order.customer.phone,
            "email": order.customer.email,
        },

        "rider": {
            "id": order.rider.id,
            "name": order.rider.name,
            "phone": order.rider.phone,
            "email": order.rider.email,
            "latitude": order.rider.latitude,
            "longitude": order.rider.longitude,
        } if order.rider else None,

        "status": order.status,
        "priority": order.priority,
        "amt_paid": order.amt_paid,

        "address": order.address,
        "address_photo": request.build_absolute_uri(order.address_photo.url) if order.address_photo else None,
        "dest_lat": order.dest_lat,
        "dest_lon": order.dest_lon,
    }

    return JsonResponse({"type": "success", "data": data_to_ret})


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["DELETE"])
def order_delete(request, order_id):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return JsonResponse({"type": "OrderException", "message": "Invalid Order"}, status=400)

    # Release the stock that was reserved for this order when it was placed
    product = order.product
    product.qty_in_stock += 1
    product.save()

    order.delete()

    return JsonResponse({"type": "success", "message": "Order Deleted"}, status=200)


@require_http_methods(["GET"])
def get_markers(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    warehouses = []
    for warehouse in Warehouse.objects.all():
        warehouses.append({
            "id": warehouse.id,
            "name": warehouse.name,
            "latitude": warehouse.latitude,
            "longitude": warehouse.longitude,
        })

    riders = []
    for rider in Rider.objects.all():
        riders.append({
            "id": rider.id,
            "name": rider.name,
            "latitude": rider.latitude,
            "longitude": rider.longitude,
        })

    orders = []
    for order in Order.objects.all():
        if order.dest_lat == 0 and order.dest_lon == 0:
            continue

        orders.append({
            "id": order.id,
            "name": f"Order #{order.id}",
            "latitude": order.dest_lat,
            "longitude": order.dest_lon,
        })

    return JsonResponse({"type": "success", "data": {"warehouses": warehouses, "riders": riders, "orders": orders}})


@require_http_methods(["GET"])
def get_audit_logs(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data_to_ret = []
    # Most recent logs first
    audit_logs = AuditLog.objects.all().order_by("-timestamp")

    for audit_log in audit_logs:
        data_to_ret.append({
            "id": audit_log.id,
            "timestamp": audit_log.timestamp.isoformat(),
            "text": audit_log.text,
            "level": audit_log.level,
        })

    return JsonResponse({"type": "success", "data": data_to_ret})


@require_http_methods(["GET"])
def customer_list(request):
    res = protected(request, "dispatcher")

    if isinstance(res, JsonResponse):
        return res

    data_to_ret = []
    customers = Customer.objects.all()

    for customer in customers:
        data_to_ret.append({
            "id": customer.id,
            "username": customer.username,
            "name": customer.name,
            "phone": customer.phone,
            "email": customer.email,
        })

    return JsonResponse({"type": "success", "data": data_to_ret})


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def customer_login(request):
    data = json.loads(request.body)

    username = data["username"]
    password = data["password"]

    try:
        Customer.objects.get(username=username, password=password)
    except Customer.DoesNotExist:
        return JsonResponse({"type": "UserException", "message": "Invalid Customer Credentials"})

    # Use the Django SECRET_KEY to sign the JWT token
    key = settings.SECRET_KEY

    # After 5 hours, user is automatically logged out
    payload = {"username": username, "password": password, "exp": dt.datetime.now(pytz.timezone("UTC")) + dt.timedelta(hours=5)}

    # Using the HS256 algorithm to encode the token
    token = jwt.encode(payload, key, algorithm="HS256")

    return JsonResponse({"type": "success", "jwtToken": token, "message": "Logged in !"}, status=200)


@conditional_decorator(csrf_exempt, env != "prod")
@conditional_decorator(csrf_protect, env == "prod")
@require_http_methods(["POST"])
def order_place(request):
    res = protected(request, "customer")

    if isinstance(res, JsonResponse):
        return res

    customer = res[1]

    data = payload_from_request(request)

    try:
        product = Product.objects.get(id=int(data["product_id"]))
    except Product.DoesNotExist:
        return JsonResponse({"type": "ProductException", "message": "Invalid Product"}, status=400)

    if product.qty_in_stock <= 0:
        return JsonResponse({"type": "ProductException", "message": "Product Out of Stock"}, status=400)

    add_photo = request.FILES.get("address_photo")
    address = data["address"]

    dest_lat, dest_lon, parsed_address, address_confidence = get_coords_from_address(address, add_photo)

    if address_confidence < 0.5:
        return JsonResponse({"type": "AddressException", "message": "Address Identification Confidence is too low"}, status=400)

    if dest_lat == 0 and dest_lon == 0:
        return JsonResponse({"type": "AddressException", "message": "Invalid Address"}, status=400)

    if parsed_address:
        address = parsed_address

    order = Order.objects.create(
        product=product,
        customer=customer,
        rider=None,

        status="UNASSIGNED",
        priority=0,
        # Customer is charged the GST-inclusive price
        amt_paid=round(product.price * (1 + GST_RATE), 2),

        address=address,
        dest_lat=dest_lat,
        dest_lon=dest_lon,
        address_photo=request.FILES.get("address_photo"),
    )
    order.save()

    # Reserve the stock for this order
    product.qty_in_stock -= 1
    product.save()

    return JsonResponse({
        "type": "success",
        "message": "Order Placed",
        "order_id": order.id,
        "address": address,
        "address_confidence": address_confidence,
    }, status=200)


@require_http_methods(["GET"])
def customer_order_list(request):
    res = protected(request, "customer")

    if isinstance(res, JsonResponse):
        return res

    customer = res[1]

    data_to_ret = []
    orders = Order.objects.filter(customer=customer)

    for order in orders:
        data_to_ret.append({
            "id": order.id,
            "product_id": order.product.id,
            "product_name": order.product.name,
            "rider_id": order.rider.id if order.rider else None,
            "rider_name": order.rider.name if order.rider else None,
            "status": order.status,
            "priority": order.priority,
            "amt_paid": order.amt_paid,
            "address": order.address,
            "dest_lat": order.dest_lat,
            "dest_lon": order.dest_lon,
        })

    return JsonResponse({"type": "success", "data": data_to_ret})
