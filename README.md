# En Route

En Route is a last-mile delivery platform for Bangalore. Customers place product orders. Dispatchers manage warehouses, riders, products, and assignments. A background routing loop builds bike routes, moves riders along those routes, and updates live order locations on a map.

The stack is a Django JSON API, a React (Vite) UI, PostgreSQL, and a Python routing process that talks to [OSRM](http://project-osrm.org/).

---

## Features

### Customer
- JWT login
- Browse products (price shown with 18% GST)
- Place an order with a typed address and/or an address photo
- Address photos are OCR’d (PaddleOCR), parsed by an LLM (Groq), and geocoded (Mapbox)
- Delivery coordinates must fall inside central Bangalore
- View own order history

### Dispatcher
- JWT login
- CRUD for **products**, **warehouses**, and **riders**
- List / view / delete orders (no order create from the dispatcher UI)
- Read-only customer list and audit logs
- **Manual assign:** pick a rider for an `UNASSIGNED` order
- **Auto assign:** OSRM picks the eligible rider with the shortest bike duration (current location → warehouse → destination). The dispatcher confirms before the assignment is committed
- Live map (polled every 1s): warehouses, riders, order destinations, live order positions, and route polylines

### Routing engine
- For each rider’s next `ASSIGNED` order, create two `RouteSegment`s:
  - `WH_PICKUP` — rider → warehouse
  - `ORDER_DELIVERY` — warehouse → order destination
- Advance riders along segment geometry each tick
- Update `Order.cur_lat` / `cur_lon` while a delivery segment is active
- Move order status `ASSIGNED` → `ON_TRANSIT` → `ON_DELIVERY` → `DELIVERED`

---

## Architecture

```
                            JWT + CSRF                                  
   React UI (Vite)      ──────────────────>    Django API (/api/…)      
   localhost:5173                              localhost:8000           
                                                             
                                                         │
                                                         V
                                                PostgreSQL (en-route)
                                                         ^
                                                         │
   logic/routing         SQLAlchemy + pandas ────────────┘
   _engine.py
   (loop run by supervisord)    
          |
          │ HTTP
          ▼
   OSRM public bike router
   router.project-osrm.org
```

All UI traffic in development hits `http://localhost:8000/api/…`. In production the built frontend is served by Django, so API paths are same-origin (`/api/…`).

---

## Tech stack

| Layer | Stack |
| --- | --- |
| API | Django 5.2, Python |
| UI | React 19 (class components), Vite 8, Tailwind CSS 4, Leaflet / react-leaflet, react-toastify |
| Database | PostgreSQL |
| Routing process | SQLAlchemy 2, pandas, requests |
| Routing / geocode | OSRM (bike profile), Mapbox Geocoding v6 |
| Address from photo | PaddleOCR, Groq (`openai/gpt-oss-20b`) |
| Production extras | gunicorn, WhiteNoise |

Coordinates are confined to Bangalore centre:

- Latitude `12.8` – `13.0`
- Longitude `77.5` – `77.75`

---

## Repository layout

```
En Route/
├── requirements.txt              Python dependencies (Django + routing)
├── webapp/                       Django project
│   ├── manage.py
│   ├── webapp/                   Project settings, URLs, WSGI/ASGI
│   │   └── settings/
│   │       ├── __init__.py       Loads prod or dev from EN_ROUTE_ENV
│   │       ├── base.py
│   │       ├── dev.py            DEBUG, local DB, CORS for Vite
│   │       └── prod.py           Static files from frontend build
│   ├── backend/                  API, models, helpers
│   ├── frontend/                 Serves the SPA in production
│   │   └── gui/                  React app (Vite)
│   └── media/                    Product and address photo uploads (gitignored)
└── logic/
    ├── db.py                     SQLAlchemy access to Django tables
    └── routing_engine.py         Route generation + live marker simulation
```

---

## Data models

| Model | Role |
| --- | --- |
| `Dispatcher` / `Customer` | Login accounts (username + password) |
| `Warehouse` | Named pickup location with lat/lon |
| `Product` | Catalog item: photo, price, weight, stock, warehouse |
| `Rider` | Name/contact, live lat/lon, `max_capacity`, `filled_capacity`, `is_stuck` |
| `Order` | Product + customer + optional rider; destination and current coords; GST-inclusive `amt_paid` |
| `RouteSegment` | One hop of a rider’s path (`geometry` is GeoJSON `[lon, lat]` pairs) |
| `AuditLog` | Timestamped operational messages |

### Order status

```
UNASSIGNED → ASSIGNED → ON_TRANSIT → ON_DELIVERY → DELIVERED / FAILED
```

| Status | Set by |
| --- | --- |
| `UNASSIGNED` | Customer place-order |
| `ASSIGNED` | Dispatcher (manual or confirmed auto) |
| `ON_TRANSIT` | Routing engine after pickup + delivery segments are created |
| `ON_DELIVERY` | Routing engine when `WH_PICKUP` geometry is exhausted |
| `DELIVERED` | Routing engine when `ORDER_DELIVERY` geometry is exhausted |
| `FAILED` | Reserved in the schema (not driven by the current UI) |

### Map markers (`GET /api/get-markers/`)

Polled every second. Orders with status `DELIVERED` or `FAILED` are omitted.
Warehouses, Riders, Order Destinations, Orders' current locations and routes are plotted.

---

## Prerequisites

- Python 3.10+
- Node.js 18+ (for the Vite UI)
- PostgreSQL with a database named `en-route`
- Internet access for OSRM, Mapbox, and Groq (used at runtime)

---

## Configuration

Environment switch (Django settings **and** `logic/db.py`):

| `EN_ROUTE_ENV` | Settings | Notes |
| --- | --- | --- |
| unset / anything except `prod` | `webapp/settings/dev.py` | CSRF exempt on mutating API views; CORS allows `http://localhost:5173` |
| `prod` | `webapp/settings/prod.py` | CSRF enforced; frontend expected at `frontend/gui/dist` |

Edit these locally (do not commit secrets):

- `webapp/webapp/settings/dev.py` — PostgreSQL user/password
- `webapp/webapp/settings/prod.py` — production DB and `ALLOWED_HOSTS`
- `logic/db.py` — same database, used by the routing loop
- `webapp/backend/helpers.py` — `MAPBOX_TOKEN` and Groq `api_key`

Dev DB defaults (as currently checked in):

- Host `localhost`, port `5432`, database `en-route`, user `postgres`

---

## Setup

From the repository root:

```bash
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create the database, then apply schema. **Migrations are gitignored**, so generate them on first clone:

```bash
cd webapp
python manage.py makemigrations backend
python manage.py migrate
python manage.py createsuperuser
```

Seed at least one **Dispatcher** and one **Customer** (Django admin at `/admin/` is the intended way; both models are registered).

Frontend:

```bash
cd webapp/frontend/gui
npm install
```

---

## Running locally

Use three terminals. Activate the venv for Python processes.

**1. API** (from `webapp/`):

```bash
python manage.py runserver
```

**2. UI** (from `webapp/frontend/gui/`):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The SPA calls `http://localhost:8000/api/…`.

**3. Routing loop** (from `logic/`):

```bash
python routing_engine.py
```

This loop sleeps 1s between ticks: create missing segments for `ASSIGNED` orders, then step riders along geometry.

Without this process, assignment still works, but the map will not animate riders, live order positions, or route polylines.

---

## Auth

- Login: `POST /api/customer-login/` or `POST /api/dispatcher-login/`
- Response: `{ "type": "success", "jwtToken": "…" }`
- Subsequent calls: header `Authorization: jwt-token <token>`
- Token is HS256, signed with Django `SECRET_KEY`, expires in 5 hours
- Role is stored in the browser (`localStorage.role` is `customer` or `dispatcher`)

---

## API (prefix `/api/`)

### Auth
| Method | Path | Who |
| --- | --- | --- |
| POST | `dispatcher-login/` | public |
| GET | `dispatcher-current-user/` | dispatcher |
| POST | `customer-login/` | public |

### Dispatcher operations
| Method | Path | Notes |
| --- | --- | --- |
| GET/POST | `warehouse-list/`, `warehouse-add/` | |
| PUT/DELETE | `warehouse-update/<id>/`, `warehouse-delete/<id>/` | Coords validated |
| GET/POST | `rider-list/`, `rider-add/` | |
| PUT/DELETE | `rider-update/<id>/`, `rider-delete/<id>/` | |
| POST/DELETE | `product-add/`, `product-update/<id>/`, `product-delete/<id>/` | Multipart photo upload; update is POST |
| GET | `order-list/`, `order-detail/<id>/` | |
| DELETE | `order-delete/<id>/` | Restores product stock |
| POST | `order-assign/<id>/` | Body `{ "rider_id": N }` — assigns immediately |
| POST | `order-assign-auto/<id>/` | Returns suggested `rider_id` / `rider_name`; does **not** assign |
| GET | `get-markers/` | Map payload |
| GET | `audit-logs/` | |
| GET | `customer-list/` | |

### Customer operations
| Method | Path | Notes |
| --- | --- | --- |
| POST | `order-place/` | Multipart: `product_id`, `address`, optional `address_photo` |
| GET | `customer-order-list/` | |

### Shared
| Method | Path | Who |
| --- | --- | --- |
| GET | `product-list/`, `product-detail/<id>/` | dispatcher and customer |

JSON errors use `{ "type": "<ExceptionName>", "message": "…" }` (for example `TokenException`, `OrderException`, `RiderException`). Success responses use `"type": "success"`.

### Auto-assign then confirm

1. UI posts `order-assign-auto/<id>/`.
2. Backend filters riders with remaining capacity ≥ product weight, then minimises OSRM bike duration over **rider → warehouse → destination**.
3. UI asks the dispatcher to confirm.
4. On confirm, UI posts `order-assign/<id>/` with that `rider_id`.

---

## Address and geocoding

`get_coords_from_address` in `webapp/backend/helpers.py`:

1. If an address photo is present, PaddleOCR extracts text fragments.
2. Groq reconstructs a single postal address and a confidence in `[0, 1]`.
3. If confidence &lt; `MIN_CONFIDENCE` (`0.4`), coordinates are rejected (`0, 0`).
4. Mapbox forward geocode returns `[lon, lat]`.
5. `verify_coords` rejects points outside the Bangalore bounding box.

Typed address-only orders skip OCR/LLM and geocode the string directly.

---

## Production notes

```bash
export EN_ROUTE_ENV=prod
cd webapp/frontend/gui && npm run build
cd ../../
python manage.py collectstatic
gunicorn webapp.wsgi:application
```

Set real values in `webapp/settings/prod.py` (`ALLOWED_HOSTS`, database user/password) and matching credentials in `logic/db.py`. Serve `MEDIA_ROOT` (`webapp/media/`) so product and address photos remain reachable.

The production frontend SPA is served from `frontend/gui/dist` via `frontend.urls` (`GET /`).

---

## Django admin

`/admin/` exposes Dispatcher, Customer, Rider, Product, Order, Warehouse, RouteSegment, and AuditLog. Use it to create the first dispatcher/customer accounts and to inspect live routes.

---

## Future plans

These are the next improvements planned for En Route:

- **Disruption simulation.** Model in-transit failures such as a rider’s bike breaking down. The routing loop would mark the rider `is_stuck`, freeze their current segment, and either wait for recovery or reassign remaining orders (and any package already on the bike) to another eligible rider. Dispatchers would see the incident on the map and in audit logs, with a path to `FAILED` when reassignment is not possible.
- **Better order assignment.** Auto-assign currently picks the eligible rider with the shortest OSRM bike duration for a single order (`rider → warehouse → destination`). A stronger algorithm would consider load balancing, remaining capacity across a batch of pending orders, existing route geometry (insert a stop instead of always starting from the rider’s current point), and estimated time of arrival rather than duration alone.
- **Docker setup.** Add a `Dockerfile` and `docker-compose.yml` so the API, Vite UI, PostgreSQL, routing loop, and optionally a local OSRM instance start with one command. That would replace the three-terminal local workflow and make production closer to `docker compose up` than a manual gunicorn + collectstatic sequence.
- **Richer audit logs.** Logs are currently a flat list of timestamp, text, and level. Improve them with actor attribution (which dispatcher/customer/routing process wrote the event), links to the related order/rider/warehouse, filters and search in the UI, and consistent coverage of assignment, status changes, OCR/geocode failures, and future disruption events.

---

## License

Private / unspecified. Treat API keys, Mapbox tokens, and database passwords as secrets; rotate anything that has been committed to settings or helpers before deploying.
