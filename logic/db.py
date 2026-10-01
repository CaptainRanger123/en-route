import os
import json
import threading
import pandas as pd
from sqlalchemy import create_engine, text


class DB:
    def __init__(self):
        env = os.environ.get("EN_ROUTE_ENV")
        print(env)

        if env == "prod":
            self.host = "localhost"
            self.port = 5432
            self.database = "en-route"
            self.username = "123456789"
            self.password = "987654321"

        else:
            self.host = "localhost"
            self.port = 5432
            self.database = "en-route"
            self.username = "postgres"
            self.password = "edx25"

        self.engine = None
        self.engine_lock = threading.Lock()

    def connect(self):
        self.engine = create_engine(
            f"postgresql+psycopg2://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}",
            connect_args={"connect_timeout": 10},
        )

    def get_user(self, id):
        with self.engine_lock:
            df = pd.read_sql(text("SELECT * FROM backend_account WHERE id=:id"), con=self.engine, params={"id": int(id)})
            return df.iloc[0]

    def get_all_riders(self):
        with self.engine_lock:
            df = pd.read_sql(text("SELECT * FROM backend_rider"), con=self.engine)
            return df

    def get_first_assigned_order(self, rider_id):
        with self.engine_lock:
            df = pd.read_sql(
                text("SELECT * FROM backend_order WHERE rider_id=:rider_id AND status='ASSIGNED' ORDER BY id ASC LIMIT 1"),
                con=self.engine,
                params={"rider_id": int(rider_id)},
            )
            return df.iloc[0] if len(df) > 0 else None

    def get_order_from_rider_and_dest_coords(self, rider_id, lat, lon):
        with self.engine_lock:
            df = pd.read_sql(
                text("SELECT * FROM backend_order WHERE rider_id=:rider_id AND dest_lat=:lat AND dest_lon=:lon ORDER BY id ASC LIMIT 1"),
                con=self.engine,
                params={"rider_id": int(rider_id), "lat": float(lat), "lon": float(lon)},
            )
            return df.iloc[0] if len(df) > 0 else None

    def get_order_in_warehouse(self, warehouse_id, rider_id):
        with self.engine_lock:
            df = pd.read_sql(
                text("SELECT ord.id FROM backend_order ord JOIN backend_product prod ON ord.product_id=prod.id WHERE prod.warehouse_id=:warehouse_id AND ord.rider_id=:rider_id AND ord.status='ON_TRANSIT' ORDER BY ord.id ASC LIMIT 1"),
                con=self.engine,
                params={"warehouse_id": int(warehouse_id), "rider_id": int(rider_id)},
            )
            return df.iloc[0] if len(df) > 0 else None

    def get_delivery_order(self, rider_id):
        with self.engine_lock:
            df = pd.read_sql(
                text("SELECT * FROM backend_order WHERE rider_id=:rider_id AND status='ON_DELIVERY' ORDER BY id ASC LIMIT 1"),
                con=self.engine,
                params={"rider_id": int(rider_id)},
            )
            return df.iloc[0] if len(df) > 0 else None

    def get_product(self, product_id):
        with self.engine_lock:
            df = pd.read_sql(text("SELECT * FROM backend_product WHERE id=:id"), con=self.engine, params={"id": int(product_id)})
            return df.iloc[0] if len(df) > 0 else None

    def get_warehouse(self, warehouse_id):
        with self.engine_lock:
            df = pd.read_sql(text("SELECT * FROM backend_warehouse WHERE id=:id"), con=self.engine, params={"id": int(warehouse_id)})
            return df.iloc[0] if len(df) > 0 else None

    def get_warehouse_from_coords(self, lat, lon):
        with self.engine_lock:
            df = pd.read_sql(
                text("SELECT * FROM backend_warehouse WHERE latitude=:lat AND longitude=:lon ORDER BY id ASC LIMIT 1"),
                con=self.engine,
                params={"lat": float(lat), "lon": float(lon)},
            )
            return df.iloc[0] if len(df) > 0 else None

    def get_route_segments(self, rider_id):
        with self.engine_lock:
            df = pd.read_sql(
                text("SELECT * FROM backend_routesegment WHERE rider_id=:rider_id ORDER BY seq_no ASC"),
                con=self.engine,
                params={"rider_id": int(rider_id)},
            )
            return df

    def get_next_route_segment(self, rider_id):
        with self.engine_lock:
            df = pd.read_sql(
                text("SELECT * FROM backend_routesegment WHERE rider_id=:rider_id ORDER BY seq_no ASC LIMIT 1"),
                con=self.engine,
                params={"rider_id": int(rider_id)},
            )
            return df.iloc[0] if len(df) > 0 else None

    def create_route_segment(self, rider_id, from_lat, from_lon, to_lat, to_lon, geometry, segment_type, seq_no):
        with self.engine_lock:
            with self.engine.begin() as conn:
                conn.execute(
                    text(
                        "INSERT INTO backend_routesegment (rider_id, from_lat, from_lon, to_lat, to_lon, geometry, segment_type, seq_no)"
                        "VALUES (:rider_id, :from_lat, :from_lon, :to_lat, :to_lon, :geometry, :segment_type, :seq_no)"
                    ),
                    {
                        "rider_id": int(rider_id),
                        "from_lat": float(from_lat),
                        "from_lon": float(from_lon),
                        "to_lat": float(to_lat),
                        "to_lon": float(to_lon),
                        "geometry": json.dumps(geometry),
                        "segment_type": segment_type,
                        "seq_no": int(seq_no),
                    },
                )

    def update_row(self, table, column, value, order_id):
        with self.engine_lock:
            with self.engine.begin() as conn:
                conn.execute(
                    text(f"UPDATE {table} SET {column}=:value WHERE id=:id"),
                    {"value": value, "id": int(order_id)}
                )

    def delete_route_segment(self, route_segment_id):
        with self.engine_lock:
            with self.engine.begin() as conn:
                conn.execute(
                    text("DELETE FROM backend_routesegment WHERE id=:id"),
                    {"id": int(route_segment_id)}
                )