import { Component } from "react";

import Modal from "./modal.jsx";
import Button from "./button.jsx";

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-amber-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600";
const labelClass = "block text-xs font-medium text-stone-600 mb-1";

const RIDER_STATUS_OPTIONS = ["AVAILABLE", "ON_DELIVERY", "OFFLINE"];

class AddRiderModal extends Component {
  constructor(props) {
    super(props);

    const rider = props.rider;

    this.state = {
      name: rider?.name ?? "",
      phone: rider?.phone ?? "",
      email: rider?.email ?? "",
      warehouse_id: "",
      max_cap: rider?.max_capacity ?? "",
      status: rider?.status ?? "AVAILABLE",
      is_stuck: rider?.is_stuck ?? false,
      error: "",
    };
  }

  handleChange = e => {
    const { name, value, type, checked } = e.target;
    this.setState({ [name]: type === "checkbox" ? checked : value });
  };

  handleSubmit = e => {
    e.preventDefault();

    const { name, phone, email, warehouse_id, max_cap, status, is_stuck } = this.state;
    const isEdit = Boolean(this.props.rider);

    if (!name.trim() || !phone || !email.trim() || !max_cap) {
      this.setState({ error: "Please fill in all fields." });
      return;
    }

    if (!isEdit && !warehouse_id) {
      this.setState({ error: "Please select a starting warehouse." });
      return;
    }

    this.setState({ error: "" });

    if (isEdit) {
      this.props.onSubmit({
        name: name.trim(),
        phone,
        email: email.trim(),
        max_cap,
        status,
        is_stuck,
      });
    } else {
      this.props.onSubmit({
        name: name.trim(),
        phone,
        email: email.trim(),
        warehouse_id,
        max_cap,
      });
    }
  };

  render() {
    const { rider, warehouses, submitting, onClose } = this.props;
    const { name, phone, email, warehouse_id, max_cap, status, is_stuck, error } = this.state;
    const isEdit = Boolean(rider);

    return (
      <Modal title={isEdit ? "Edit Rider" : "Add Rider"} onClose={onClose}>
        {!isEdit && warehouses.length === 0 ? (
          <p className="text-sm text-stone-500">Add a warehouse first — riders start out at a warehouse's location.</p>
        ) : (
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input name="name" value={name} onChange={this.handleChange} placeholder="Rider's full name" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" name="phone" value={phone} onChange={this.handleChange} placeholder="Phone number" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Max Capacity (in kg)</label>
                <input type="number" min="0" name="max_cap" value={max_cap} onChange={this.handleChange} placeholder="e.g. 10" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="email" value={email} onChange={this.handleChange} placeholder="rider@example.com" className={inputClass} />
            </div>

            {isEdit ? (
              <>
                <div>
                  <label className={labelClass}>Status</label>
                  <select name="status" value={status} onChange={this.handleChange} className={inputClass}>
                    {RIDER_STATUS_OPTIONS.map(statusOption => (
                      <option key={statusOption} value={statusOption}>{statusOption.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-stone-700">
                  <input type="checkbox" name="is_stuck" checked={is_stuck} onChange={this.handleChange} className="rounded border-amber-300 text-amber-800 focus:ring-amber-600" />
                  Mark as stuck
                </label>
              </>
            ) : (
              <div>
                <label className={labelClass}>Starting Warehouse</label>
                <select name="warehouse_id" value={warehouse_id} onChange={this.handleChange} className={inputClass}>
                  <option value="">Select a warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button text="Cancel" type="button" color="stone" variant="outline" fullWidth onClick={onClose} />
              <Button
                text={submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Rider"}
                type="submit"
                color="coffee"
                fullWidth
                disabled={submitting}
              />
            </div>
          </form>
        )}
      </Modal>
    );
  }
}

export default AddRiderModal;
