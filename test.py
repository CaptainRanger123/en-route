import json
from groq import Groq

# ==========================
# Groq LLM API
# ==========================

# client = Groq(api_key="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")

# ocr_texts = [
#     "Banglore",
#     "Indiranagar, "
# ]

# fragments = json.dumps(ocr_texts, ensure_ascii=False)
# prompt = (
#     "You are an expert at parsing addresses from fragments."
#     "Given the following OCR text fragments from a photo of a delivery address, "
#     "reconstruct a single, complete, geocodable postal address"
#     "(house/building, street, area, city, state, pincode if present)."
#     "The fragments may be out of order, duplicated, or noisy.\n\n"
#     f"OCR fragments (JSON list):\n{fragments}\n\n"
#     "Respond with JSON only in this exact shape:\n"
#     '{"address": "<parsed address>", "confidence": <number between 0 and 1>}\n'
#     "confidence is your overall confidence that the parsed address is complete and correct."
#     "Don't include/invent any other text in your response."
#     "Whichever segment of the address is not present, keep it empty"
# )

# chat_completion = client.chat.completions.create(
#     messages=[
#         {
#             "role": "system",
#             "content": prompt
#         }
#     ],
#     model="openai/gpt-oss-20b",
# )
# print("Chat completion: ", chat_completion.choices[0].message.content)

# ==========================
# Mapbox Geocoding API
# ==========================

# import requests as r

# search_text = "INDIRANAGAR, BANGALORE, KARNATAKA"
# token = "pk.eyJ1IjoiYWJoeXVkYXlhMjUiLCJhIjoiY211b2t6bDRmMDAybzJ5cjQ0cnc3b2ZpdCJ9.AeerekrhBLiLUSp1oolPow"

# res = r.get(f"https://api.mapbox.com/search/geocode/v6/forward?q={search_text}&access_token={token}")
# print(res.text)

# print(res.json()["features"][0]["geometry"]["coordinates"])

# ==========================
# ORSM Routing API
# ==========================

import requests as r

service = "route"
version = "v1"
profile = "bike"
start_coords = (77.646, 12.842)
end_coords = (77.665, 12.836)

res = r.get(f"http://router.project-osrm.org/{service}/{version}/{profile}/{start_coords[0]},{start_coords[1]};{end_coords[0]},{end_coords[1]}?overview=simplified&geometries=geojson&alternatives=false")
data = res.json()

if data["code"] == "Ok":
    print(data["routes"][0]["legs"][0]["duration"])
    print(data["routes"][0]["geometry"]["coordinates"])