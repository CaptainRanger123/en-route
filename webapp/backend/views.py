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

env = os.environ.get("EN_ROUTE_ENV")


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

    try:
        if user_type == "dispatcher":
            user = Dispatcher.objects.get(username=payload["username"], password=payload["password"])
        elif user_type == "customer":
            user = Customer.objects.get(username=payload["username"], password=payload["password"])
        else:
            return JsonResponse({"type": "UserException", "message": "Invalid User Type"}, status=400)

    except Dispatcher.DoesNotExist:
        return JsonResponse({"type": "UserException", "message": "Invalid Dispatcher Account"}, status=400)

    except Customer.DoesNotExist:
        return JsonResponse({"type": "UserException", "message": "Invalid Customer Account"}, status=400)

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