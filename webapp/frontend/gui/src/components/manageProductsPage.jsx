import { Component } from "react";

import AddProductModal from "./addProductModal.jsx";
import Button from "./button.jsx";

class ManageProductsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showAdd: false,
      editingProduct: null,
    };
  }

  handleAddSubmit = async data => {
    const success = await this.props.onAddProduct(data);
    if (success) this.setState({ showAdd: false });
  };

  handleEditSubmit = async data => {
    const success = await this.props.onUpdateProduct(this.state.editingProduct.id, data);
    if (success) this.setState({ editingProduct: null });
  };

  handleDelete = product => {
    if (window.confirm(`Delete product "${product.name}"?`)) {
      this.props.onDeleteProduct(product.id);
    }
  };

  render() {
    const { products, warehouses, loading, saving } = this.props;
    const { showAdd, editingProduct } = this.state;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Products</h1>
            <p className="text-sm text-stone-500 mt-1">Manage the products available for customers to order.</p>
          </div>
          <Button text="Add Product" color="coffee" onClick={() => this.setState({ showAdd: true })} />
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">No products added yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Warehouse</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Price incl. GST</th>
                  <th className="px-5 py-3 font-medium">Weight</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{product.name}</td>
                    <td className="px-5 py-3.5 text-stone-600">{product.warehouse_name}</td>
                    <td className="px-5 py-3.5 text-stone-600">₹{product.price.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-stone-900">₹{product.price_with_gst.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-stone-600">{product.weight} kg</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                        product.qty_in_stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                      }`}>
                        {product.qty_in_stock > 0 ? `${product.qty_in_stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onClick={() => this.setState({ editingProduct: product })} className="text-xs font-medium text-amber-800 hover:text-amber-900 cursor-pointer mr-4">
                        Edit
                      </button>
                      <button onClick={() => this.handleDelete(product)} className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showAdd && (
          <AddProductModal
            warehouses={warehouses}
            submitting={saving}
            onClose={() => this.setState({ showAdd: false })}
            onSubmit={this.handleAddSubmit}
          />
        )}

        {editingProduct && (
          <AddProductModal
            product={editingProduct}
            warehouses={warehouses}
            submitting={saving}
            onClose={() => this.setState({ editingProduct: null })}
            onSubmit={this.handleEditSubmit}
          />
        )}
      </div>
    );
  }
}

export default ManageProductsPage;
