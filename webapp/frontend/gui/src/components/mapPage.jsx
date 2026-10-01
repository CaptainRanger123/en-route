import { Component } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// // Leaflet's default marker icon paths don't resolve correctly under Vite's
// // bundler, so point them at the bundled asset URLs explicitly.
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// Bangalore
const MAP_CENTER = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

const WAREHOUSE_COLOR = "#92400e";
const RIDER_COLOR = "#1d4ed8";
const ORDER_DEST_COLOR = "#16a34a";
const ORDER_POS_COLOR = "#7c3aed";
const ROUTE_COLOR = "#ea580c";

const geometryToLatLngs = geometry => {
  if (!Array.isArray(geometry)) {
    return [];
  }

  return geometry
    .filter(pair => Array.isArray(pair) && pair.length >= 2)
    .map(([lon, lat]) => [lat, lon]);
};

const escapeHtml = text => String(text)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const labeledIcon = (name, color, shape = "circle") => L.divIcon({
  className: "labeled-marker",
  html: `
    <div class="labeled-marker-inner">
      <span class="labeled-marker-name" style="border-color: ${color}; color: ${color};">${escapeHtml(name)}</span>
      <span class="${shape === "diamond" ? "labeled-marker-diamond" : "labeled-marker-dot"}" style="background: ${color};"></span>
    </div>
  `,
  iconSize: [160, 42],
  iconAnchor: [80, 42],
});

class MapPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      warehouses: [],
      riders: [],
      orderDestinations: [],
      orderPositions: [],
      routeSegments: [],
    }

    this.pollId = null;
    this.fetching = false;
    this.unmounted = false;
  }

  componentDidMount() {
    this.fetchMarkers();
    this.pollId = setInterval(this.fetchMarkers, 1000);
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
  }

  fetchMarkers = async () => {
    if (this.fetching) {
      return;
    }

    this.fetching = true;

    const json = await this.props.request("get-markers/", "GET", null, true, false);

    if (!this.unmounted && json.type === "success") {
      this.setState({
        warehouses: json.data.warehouses,
        riders: json.data.riders,
        orderDestinations: json.data.order_destinations || [],
        orderPositions: json.data.order_positions || [],
        routeSegments: json.data.route_segments || [],
      });
    }

    this.fetching = false;
  };

  render() {
    const { warehouses, riders, orderDestinations, orderPositions, routeSegments } = this.state;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Map</h1>
            <p className="text-sm text-stone-500 mt-1">Live warehouse, rider, order destinations, and routes across Bangalore.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: WAREHOUSE_COLOR }}></span>
              Warehouse
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: RIDER_COLOR }}></span>
              Rider
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: ORDER_DEST_COLOR }}></span>
              Order Destination
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45" style={{ background: ORDER_POS_COLOR }}></span>
              Order Location
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-5 h-0.5 rounded-full" style={{ background: ROUTE_COLOR }}></span>
              Route
            </span>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden" style={{ height: "70vh" }}>
          <MapContainer
            center={MAP_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {warehouses.map(warehouse => (
              <Marker
                key={`warehouse-${warehouse.id}`}
                position={[warehouse.latitude, warehouse.longitude]}
                icon={labeledIcon(warehouse.name, WAREHOUSE_COLOR)}
              />
            ))}

            {riders.map(rider => (
              <Marker
                key={`rider-${rider.id}`}
                position={[rider.latitude, rider.longitude]}
                icon={labeledIcon(rider.name, RIDER_COLOR)}
              />
            ))}

            {orderDestinations.map(order => (
              <Marker
                key={`order-dest-${order.id}`}
                position={[order.latitude, order.longitude]}
                icon={labeledIcon(order.name, ORDER_DEST_COLOR)}
              />
            ))}

            {orderPositions.map(order => (
              <Marker
                key={`order-pos-${order.id}`}
                position={[order.latitude, order.longitude]}
                icon={labeledIcon(order.name, ORDER_POS_COLOR, "diamond")}
              />
            ))}

            {routeSegments.map(segment => {
              const positions = geometryToLatLngs(segment.geometry);

              if (positions.length < 2) {
                return null;
              }

              return (
                <Polyline
                  key={`route-${segment.id}`}
                  positions={positions}
                  pathOptions={{ color: ROUTE_COLOR, weight: 4, opacity: 0.85 }}
                />
              );
            })}
          </MapContainer>
        </div>
      </div>
    );
  }
}

export default MapPage;
