import { Component } from "react";

import OrderModal from "./orderModal.jsx";

class ProductsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedProduct: null,
    };
  }

  handleSubmitOrder = async data => {
    const success = await this.props.onPlaceOrder(data);

    if (success) {
      this.setState({ selectedProduct: null });
    }
  };

  render() {
    const { products, loading, placingOrder } = this.props;
    const { selectedProduct } = this.state;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500 mt-1">Browse available products and place an order for delivery.</p>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">No products are available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="h-36 bg-amber-100 flex items-center justify-center">
                  {product.photo ? (
                    <img src={product.photo} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-stone-400 text-sm">No image</span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-stone-900 text-sm">{product.name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                        product.qty_in_stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {product.qty_in_stock > 0 ? `${product.qty_in_stock} in stock` : "Out of stock"}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">{product.description}</p>
                  )}

                  <div className="mt-3 pt-3 border-t border-amber-100 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold text-stone-900">₹{product.price_with_gst.toFixed(2)}</p>
                      <p className="text-[11px] text-stone-400">
                        ₹{product.price.toFixed(2)} + {(product.gst_rate * 100).toFixed(0)}% GST
                      </p>
                    </div>

                    <button
                      onClick={() => this.setState({ selectedProduct: product })}
                      disabled={product.qty_in_stock <= 0}
                      className="text-sm font-medium px-3 py-2 rounded-lg bg-amber-800 text-white hover:bg-amber-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedProduct && (
          <OrderModal
            product={selectedProduct}
            submitting={placingOrder}
            onClose={() => this.setState({ selectedProduct: null })}
            onSubmit={this.handleSubmitOrder}
          />
        )}
      </div>
    );
  }
}

export default ProductsPage;
