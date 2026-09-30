import { Component } from "react";

import Button from "./button.jsx";

class OrderModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      address_photo: null,
      error: "",
    }
  }

  handleAddressChange = e => {
    this.setState({ address: e.target.value });
  }

  handleCoordChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handlePhotoChange = e => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    this.setState({ address_photo: file });
  }

  handleSubmit = e => {
    e.preventDefault();

    const { address, dest_lat, dest_lon, address_photo } = this.state;
    const { product, onSubmit } = this.props;

    // if (!address.trim()) {
    //   this.setState({ error: "Please enter a delivery address." });
    //   return;
    // }

    // if (dest_lat === "" || dest_lon === "") {
    //   this.setState({ error: "Please provide delivery coordinates, or use your current location." });
    //   return;
    // }

    this.setState({ error: "" });

    const formData = new FormData();
    formData.append("product_id", product.id);
    formData.append("address", address.trim());
    formData.append("dest_lat", dest_lat);
    formData.append("dest_lon", dest_lon);

    if (address_photo) {
      formData.append("address_photo", address_photo);
    }

    onSubmit(formData);
  }

  render() {
    const { product, submitting, onClose } = this.props;
    const { address, dest_lat, dest_lon, locating, address_photo, error } = this.state;

    return (
      <div className="fixed inset-0 bg-stone-900/40 flex items-center justify-center px-4 z-20">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
          <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Place Order</h2>
              <p className="text-xs text-stone-500 mt-0.5">{product.name}</p>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer">
              &times;
            </button>
          </div>

          <form onSubmit={this.handleSubmit} className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm bg-amber-50 rounded-lg px-4 py-3">
              <span className="text-stone-500">Amount payable (incl. GST)</span>
              <span className="font-semibold text-stone-900">₹{product.price_with_gst.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Delivery Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={this.handleAddressChange}
                placeholder="House no., street, city, pincode"
                className="w-full px-3 py-2.5 rounded-lg border border-amber-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Address Photo</label>
              <input
                type="file"
                name="address_photo"
                accept="image/*"
                onChange={this.handlePhotoChange}
                className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-800 file:text-white file:cursor-pointer hover:file:bg-amber-900 cursor-pointer"
              />
              {address_photo && (
                <p className="text-xs text-stone-500 mt-1">{address_photo.name}</p>
              )}
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button text="Cancel" type="button" color="stone" variant="outline" fullWidth onClick={onClose} />
              <Button
                text={submitting ? "Placing..." : "Confirm Order"}
                type="submit"
                color="coffee"
                fullWidth
                disabled={submitting}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default OrderModal;
