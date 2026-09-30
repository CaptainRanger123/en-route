ORDER_STATUSES = [
    ("UNASSIGNED", "UNASSIGNED"),
    ("ASSIGNED", "ASSIGNED"),
    ("IN_TRANSIT", "IN_TRANSIT"),
    ("DELIVERED", "DELIVERED"),
    ("FAILED", "FAILED"),
]

RIDER_STATUSES = [
    ("AVAILABLE", "AVAILABLE"),
    ("ON_DELIVERY", "ON_DELIVERY"),
    ("OFFLINE", "OFFLINE"),
]

# Standard GST slab applied on top of every product's listed price
GST_RATE = 0.18