import json
import traceback
import requests as r


class Router:
    def __init__(self, db):
        self.db = db

    def generate_geometry(self, from_lat, from_lon, to_lat, to_lon):
        try:
            service = "route"
            version = "v1"
            profile = "bike"

            res = r.get(f"http://router.project-osrm.org/{service}/{version}/{profile}/{from_lon},{from_lat};{to_lon},{to_lat}?overview=full&geometries=geojson&alternatives=false")
            data = res.json()

            if data["code"] == "Ok":
                geometry = data["routes"][0]["geometry"]["coordinates"]
                return geometry
            else:
                return []

        except Exception:
            traceback.print_exc()
            return []

    def update_routes(self):
        riders = self.db.get_all_riders()

        for i, rider in riders.iterrows():
            order = self.db.get_first_assigned_order(rider.id)

            if order is not None:
                order_product = self.db.get_product(order.product_id)
                order_wh = self.db.get_warehouse(order_product.warehouse_id)

                route_segments = self.db.get_route_segments(rider.id)

                if len(route_segments) == 0:
                    start_lat = rider.latitude
                    start_lon = rider.longitude

                    seq_no = 1

                else:
                    start_lat = route_segments[-1].to_lat
                    start_lon = route_segments[-1].to_lon

                    seq_no = len(route_segments) + 1

                geo1 = self.generate_geometry(start_lat, start_lon, order_wh.latitude, order_wh.longitude)
                self.db.create_route_segment(
                    rider.id,
                    start_lat,
                    start_lon,
                    order_wh.latitude,
                    order_wh.longitude,
                    geo1,
                    "WH_PICKUP",
                    seq_no
                )
                geo2 = self.generate_geometry(order_wh.latitude, order_wh.longitude, order.dest_lat, order.dest_lon)
                self.db.create_route_segment(
                    rider.id,
                    order_wh.latitude,
                    order_wh.longitude,
                    order.dest_lat,
                    order.dest_lon,
                    geo2,
                    "ORDER_DELIVERY",
                    seq_no+1
                )

                self.db.update_row("backend_order", "status", "ON_TRANSIT", order.id)

    def update_markers(self):
        riders = self.db.get_all_riders()

        for i, rider in riders.iterrows():
            route_segment = self.db.get_next_route_segment(rider.id)

            if route_segment is not None:
                geo = route_segment.geometry
                new_geo = geo[1:]

                self.db.update_row("backend_rider", "longitude", float(geo[0][0]), int(rider.id))
                self.db.update_row("backend_rider", "latitude", float(geo[0][1]), int(rider.id))

                if route_segment.segment_type == "ORDER_DELIVERY":
                    order_for_delivery = self.db.get_delivery_order(rider.id)

                    self.db.update_row("backend_order", "cur_lon", float(geo[0][0]), int(order_for_delivery.id))
                    self.db.update_row("backend_order", "cur_lat", float(geo[0][1]), int(order_for_delivery.id))

                if len(new_geo) > 0:
                    self.db.update_row("backend_routesegment", "geometry", json.dumps(new_geo), int(route_segment.id))
                else:
                    if route_segment.segment_type == "ORDER_DELIVERY":
                        order = self.db.get_order_from_rider_and_dest_coords(rider.id, route_segment.to_lat, route_segment.to_lon)

                        if order is None:
                            # Audit Log error here
                            continue
                        else:
                            self.db.update_row("backend_order", "status", "DELIVERED", int(order.id))

                    elif route_segment.segment_type == "WH_PICKUP":
                        warehouse = self.db.get_warehouse_from_coords(route_segment.to_lat, route_segment.to_lon)
                        if warehouse is None:
                            # Audit Log error here
                            continue
                        else:
                            order = self.db.get_order_in_warehouse(warehouse.id, rider.id)
                            self.db.update_row("backend_order", "status", "ON_DELIVERY", int(order.id))

                    self.db.delete_route_segment(route_segment.id)


if __name__ == "__main__":
    from time import sleep
    from db import DB

    db = DB()
    db.connect()

    router = Router(db)

    def main():
        while True:
            print("Iteration")
            router.update_routes()
            router.update_markers()
            sleep(1) # To stop CPU from overclocking

    main()
