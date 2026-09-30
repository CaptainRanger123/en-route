import { Component } from "react";

import Modal from "./modal.jsx";
import Button from "./button.jsx";

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-amber-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600";
const labelClass = "block text-xs font-medium text-stone-600 mb-1";

class AddProductModal extends Component {
  constructor(props) {
    super(props);

    const product = props.product;

    this.state = {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      weight: product?.weight ?? "",
      qty_in_stock: product?.qty_in_stock ?? "",
      warehouse_id: product?.warehouse_id ?? "",
      photo: null,
      error: "",
    };
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handlePhotoChange = e => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    this.setState({ photo: file });
  };

  handleSubmit = e => {
    e.preventDefault();

    const { name, description, price, weight, qty_in_stock, warehouse_id, photo } = this.state;

    if (!name.trim() || price === "" || weight === "" || qty_in_stock === "" || !warehouse_id) {
      this.setState({ error: "Please fill in all required fields." });
      return;
    }

    this.setState({ error: "" });

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("weight", weight);
    formData.append("qty_in_stock", qty_in_stock);
    formData.append("warehouse_id", warehouse_id);

    if (photo) {
      formData.append("photo", photo);
    }

    this.props.onSubmit(formData);
  };

  render() {
    const { product, warehouses, submitting, onClose } = this.props;
    const { name, description, price, weight, qty_in_stock, warehouse_id, error } = this.state;
    const isEdit = Boolean(product);

    return (
      <Modal title={isEdit ? "Edit Product" : "Add Product"} onClose={onClose}>
        {warehouses.length === 0 ? (
          <p className="text-sm text-stone-500">Add a warehouse first — every product must belong to one.</p>
        ) : (
          <form onSubmit={this.handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input name="name" value={name} onChange={this.handleChange} placeholder="Product name" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea rows={2} name="description" value={description} onChange={this.handleChange} placeholder="Short description (optional)" className={inputClass} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Price (₹)</label>
                <input type="number" min="0" step="0.01" name="price" value={price} onChange={this.handleChange} placeholder="0.00" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" min="0" step="0.01" name="weight" value={weight} onChange={this.handleChange} placeholder="0.00" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Stock Qty</label>
                <input type="number" min="0" name="qty_in_stock" value={qty_in_stock} onChange={this.handleChange} placeholder="0" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Warehouse</label>
              <select name="warehouse_id" value={warehouse_id} onChange={this.handleChange} className={inputClass}>
                <option value="">Select a warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Product Photo</label>
              {isEdit && product.photo && !this.state.photo && (
                <img src={product.photo} alt={product.name} className="h-20 w-20 object-cover rounded-lg border border-amber-200 mb-2" />
              )}
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={this.handlePhotoChange}
                className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-800 file:text-white file:cursor-pointer hover:file:bg-amber-900 cursor-pointer"
              />
              {this.state.photo && (
                <p className="text-xs text-stone-500 mt-1">{this.state.photo.name}</p>
              )}
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button text="Cancel" type="button" color="stone" variant="outline" fullWidth onClick={onClose} />
              <Button
                text={submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
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

export default AddProductModal;
