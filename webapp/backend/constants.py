ORDER_STATUSES = [
    ("UNASSIGNED", "UNASSIGNED"),
    ("ASSIGNED", "ASSIGNED"),
    ("ON_TRANSIT", "ON_TRANSIT"),
    ("ON_DELIVERY", "ON_DELIVERY"),
    ("DELIVERED", "DELIVERED"),
    ("FAILED", "FAILED"),
]

SEGMENT_TYPES = [
    ("WH_PICKUP", "WH_PICKUP"),
    ("ORDER_DELIVERY", "ORDER_DELIVERY")
]

# Standard GST slab applied on top of every product's listed price
GST_RATE = 0.18

# Confine all coords to Bangaluru Centre
MIN_LAT = 12.8
MAX_LAT = 13.0
MIN_LON = 77.5
MAX_LON = 77.75

# Minimum confidence in address parsing by LLM
MIN_CONFIDENCE = 0.4