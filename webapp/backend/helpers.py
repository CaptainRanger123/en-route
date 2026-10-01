import os
import json
import requests
import traceback
import numpy as np
from PIL import Image
from groq import Groq
# from google import genai
from paddleocr import PaddleOCR

from .constants import MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, MIN_CONFIDENCE

from .models import Rider

MAPBOX_TOKEN = "pk.eyJ1IjoiYWJoeXVkYXlhMjUiLCJhIjoiY211b2t6bDRmMDAybzJ5cjQ0cnc3b2ZpdCJ9.AeerekrhBLiLUSp1oolPow"

client = Groq(api_key="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")

ocr = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=True,
    enable_mkldnn=False
)

# client = genai.Client()

# GEMINI_MODEL = "gemini-2.0-flash"
# GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


def _ocr_input(image_path):
    """Accept a filesystem path or a Django uploaded file."""
    if hasattr(image_path, "read"):
        image = Image.open(image_path).convert("RGB")
        if hasattr(image_path, "seek"):
            image_path.seek(0)
        return np.array(image)

    return image_path


def _texts_from_ocr_result(res):
    data = res

    if hasattr(res, "json"):
        data = res.json() if callable(res.json) else res.json

    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            return [data] if data.strip() else []

    if isinstance(data, dict):
        inner = data.get("res", data)
        rec_texts = inner.get("rec_texts") or inner.get("rec_text")
        if rec_texts is not None:
            if isinstance(rec_texts, str):
                return [rec_texts]
            return [str(t) for t in rec_texts if t]

    if hasattr(res, "get"):
        rec_texts = res.get("rec_texts") or res.get("rec_text")
        if rec_texts is not None:
            if isinstance(rec_texts, str):
                return [rec_texts]
            return [str(t) for t in rec_texts if t]

    return []


def extract_text(image_path):
    img = _ocr_input(image_path)
    result = ocr.predict(img)

    lines = []
    for res in result:
        lines.extend(_texts_from_ocr_result(res))

    lines = [line.strip() for line in lines if line and str(line).strip()]

    if hasattr(image_path, "seek"):
        image_path.seek(0)

    return lines


# def _gemini_api_key():
#     key = os.environ.get("GEMINI_API_KEY", "")

#     try:
#         from django.conf import settings
#         key = key or getattr(settings, "GEMINI_API_KEY", "")
#     except Exception:
#         pass

#     return key


# def _parse_gemini_json(raw_text):
#     text = (raw_text or "").strip()

#     if text.startswith("```"):
#         text = text.strip("`")
#         if text.lower().startswith("json"):
#             text = text[4:]
#         text = text.strip()

#     return json.loads(text)


def parse_address_with_llm(ocr_texts):
    """Turn OCR fragments into one address and an overall confidence in [0, 1]."""
    # api_key = _gemini_api_key()
    # if not api_key:
    #     raise RuntimeError("GEMINI_API_KEY is not set")

    fragments = json.dumps(ocr_texts, ensure_ascii=False)
    prompt = (
        "You are an expert at parsing addresses from fragments."
        "Given the following OCR text fragments from a photo of a delivery address, "
        "reconstruct a single, complete, geocodable postal address"
        "(house/building, street, area, city, state, pincode if present)."
        "The fragments may be out of order, duplicated, or noisy.\n\n"
        f"OCR fragments (JSON list):\n{fragments}\n\n"
        "Respond with JSON only in this exact shape:\n"
        '{"address": "<parsed address>", "confidence": <number between 0 and 1>}\n'
        "confidence is your overall confidence that the parsed address is complete and correct."
        "Don't include/invent any other text in your response."
        "Whichever segment of the address is not present, keep it empty"
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": prompt
            }
        ],
        model="openai/gpt-oss-20b",
    )

    # interaction = client.interactions.create(
    #     model="gemini-3.8-flash",
    #     input=prompt,
    #     generation_config={
    #         "temperature": 0.1,
    #         "thinking_level": "low"
    #     }
    # )

    print("Chat completion: ", chat_completion.choices[0].message.content)
    parsed = json.loads(chat_completion.choices[0].message.content)

    # raw_text = gemini_data["candidates"][0]["content"]["parts"][0]["text"]
    # parsed = _parse_gemini_json(raw_text)

    address = str(parsed.get("address", "")).strip()
    confidence = float(parsed.get("confidence", 0))
    confidence = max(0.0, min(1.0, confidence))

    return {"address": address, "confidence": confidence}


def get_coords_from_address(address, address_photo=None):
    print("Address: ", address)
    print("Address photo: ", address_photo)

    latitude = 0
    longitude = 0
    confidence = 1 # If no photo is provided, we assume the address is correct

    if address_photo:
        try:
            ocr_texts = extract_text(address_photo)
            print("OCR texts: ", ocr_texts)

            parsed = parse_address_with_llm(ocr_texts)
            address = parsed["address"]
            confidence = parsed["confidence"]

            print("Address parsed by LLM: ", address)
            print("LLM confidence: ", confidence)

            if confidence < MIN_CONFIDENCE:
                return (0, 0, address, 0)

        except Exception:
            traceback.print_exc()
            return (0, 0, address, 0)

    if address and address != "":
        print("Address provided: ", address)

        # url = "https://nominatim.openstreetmap.org/search"
        # params = {
        #     "q": address,
        #     "format": "json",
        #     "limit": 1
        # }
        # headers = {
        #     "User-Agent": "EnRoute/1.0"
        # }

        try:
            geo_res = requests.get(f"https://api.mapbox.com/search/geocode/v6/forward?q={address}&access_token={MAPBOX_TOKEN}")
            print(geo_res.text)
            geo_data = geo_res.json()

            # geo_res = requests.get(url, params=params, headers=headers)
            # print(geo_res.text)
            # geo_data = geo_res.json()

            print("Geo Res: ", geo_res)
            print("Geo data: ", geo_data)

            if geo_data:
                coords = geo_data["features"][0]["geometry"]["coordinates"]

                latitude = float(coords[1])
                longitude = float(coords[0])

        except Exception:
            traceback.print_exc()
            return (0, 0, address, confidence if confidence is not None else 0)

    return (latitude, longitude, address, confidence)


def select_rider_automatically(order):
    """
    Choose a rider for an UNASSIGNED order.

    Eligible riders must have remaining capacity (max - filled) at least
    the product weight. Among those, pick the shortest OSRM bike duration
    from the rider's current coordinates to the warehouse, then to the
    order destination.
    """
    warehouse = order.product.warehouse
    product_weight = order.product.weight
    warehouse_coords = (warehouse.longitude, warehouse.latitude)
    dest_coords = (order.dest_lon, order.dest_lat)

    service = "route"
    version = "v1"
    profile = "bike"

    best_rider = None
    best_duration = None

    for rider in Rider.objects.all():
        remaining_capacity = rider.max_capacity - rider.filled_capacity
        if remaining_capacity < product_weight:
            continue

        start = (rider.longitude, rider.latitude)

        try:
            res = requests.get(
                f"http://router.project-osrm.org/{service}/{version}/{profile}/"
                f"{start[0]},{start[1]};{warehouse_coords[0]},{warehouse_coords[1]};{dest_coords[0]},{dest_coords[1]}"
                "?overview=simplified&geometries=geojson&alternatives=false",
                timeout=20
            )
            data = res.json()
        except Exception:
            traceback.print_exc()
            continue

        print(data)

        if data.get("code") != "Ok":
            continue

        duration = data["routes"][0]["duration"]
        print(f"{rider.name} duration: {duration}")

        if best_duration is None or duration < best_duration:
            best_duration = duration
            best_rider = rider

    return best_rider


def verify_coords(lat, lon):
    return bool(
        MIN_LAT <= lat <= MAX_LAT
        and
        MIN_LON <= lon <= MAX_LON
    )