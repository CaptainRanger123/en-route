import { Component } from "react";

import Modal from "./modal.jsx";
import Button from "./button.jsx";

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-amber-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600";
const labelClass = "block text-xs font-medium text-stone-600 mb-1";

class AddWarehouseModal extends Component {
  constructor(props) {
    super(props);

    const warehouse = props.warehouse;

    this.state = {
      name: warehouse?.name ?? "",
      latitude: warehouse?.latitude ?? "",
      longitude: warehouse?.longitude ?? "",
      locating: false,
      error: "",
    };
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  useCurrentLocation = () => {
    if (!navigator.geolocation) {
      this.setState({ error: "Geolocation is not supported by your browser." });
      return;
    }

    this.setState({ locating: true, error: "" });

    navigator.geolocation.getCurrentPosition(
      pos => {
        this.setState({
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          locating: false,
        });
      },
      () => {
        this.setState({
          error: "Could not fetch your location. Please enter coordinates manually.",
          locating: false,
        });
      }
    );
  };

  handleSubmit = e => {
    e.preventDefault();

    const { name, latitude, longitude } = this.state;

    if (!name.trim() || latitude === "" || longitude === "") {
      this.setState({ error: "Please fill in all fields." });
      return;
    }

    this.setState({ error: "" });

    this.props.onSubmit({
      name: name.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });
  };

  render() {
    const { warehouse, submitting, onClose } = this.props;
    const { name, latitude, longitude, locating, error } = this.state;
    const isEdit = Boolean(warehouse);

    return (
      <Modal title={isEdit ? "Edit Warehouse" : "Add Warehouse"} onClose={onClose}>
        <form onSubmit={this.handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input name="name" value={name} onChange={this.handleChange} placeholder="e.g. Central Warehouse" className={inputClass} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass}>Coordinates</label>
              <button
                type="button"
                onClick={this.useCurrentLocation}
                className="text-xs font-medium text-amber-800 hover:text-amber-900 cursor-pointer"
              >
                {locating ? "Locating..." : "Use current location"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any" name="latitude" placeholder="Latitude" value={latitude} onChange={this.handleChange} className={inputClass} />
              <input type="number" step="any" name="longitude" placeholder="Longitude" value={longitude} onChange={this.handleChange} className={inputClass} />
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button text="Cancel" type="button" color="stone" variant="outline" fullWidth onClick={onClose} />
            <Button
              text={submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Warehouse"}
              type="submit"
              color="coffee"
              fullWidth
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>
    );
  }
}

export default AddWarehouseModal;
