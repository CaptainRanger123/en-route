import { Component } from "react";

import Modal from "./modal.jsx";
import Button from "./button.jsx";
import StatusBadge from "./statusBadge.jsx";

class OrderDetailModal extends Component {
  handleDelete = () => {
    const { order, onDelete } = this.props;

    if (window.confirm("Delete this order? This will restore the product's stock.")) {
      onDelete(order.id);
    }
  };

  render() {
    const { order, loading, deleting, onClose } = this.props;

    return (
      <Modal title={`Order #${order.id}`} onClose={onClose} maxWidth="max-w-lg">
        {loading || !order.product ? (
          <p className="text-sm text-stone-500">Loading order details...</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={order.status} />
              <span className="text-sm font-semibold text-stone-900">₹{order.amt_paid.toFixed(2)} paid</span>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">Product</p>
              <div className="bg-amber-50 rounded-lg px-4 py-3 text-sm">
                <p className="font-medium text-stone-900">{order.product.name}</p>
                <p className="text-stone-500 text-xs mt-0.5">₹{order.product.price.toFixed(2)} &middot; {order.product.weight} kg</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">Customer</p>
                <div className="bg-amber-50 rounded-lg px-4 py-3 text-sm">
                  <p className="font-medium text-stone-900">{order.customer.name}</p>
                  <p className="text-stone-500 text-xs mt-0.5">{order.customer.phone}</p>
                  <p className="text-stone-500 text-xs">{order.customer.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">Rider</p>
                <div className="bg-amber-50 rounded-lg px-4 py-3 text-sm">
                  {order.rider ? (
                    <>
                      <p className="font-medium text-stone-900">{order.rider.name}</p>
                      <p className="text-stone-500 text-xs mt-0.5">{order.rider.phone}</p>
                      <p className="text-stone-500 text-xs">{order.rider.email}</p>
                    </>
                  ) : (
                    <p className="text-stone-500">Not yet assigned</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">Delivery</p>
              <div className="bg-amber-50 rounded-lg px-4 py-3 text-sm space-y-1">
                <p className="text-stone-900">{order.address || "No address provided"}</p>
                <p className="text-stone-500 text-xs">Lat {order.dest_lat}, Lon {order.dest_lon}</p>
                <p className="text-stone-500 text-xs">Priority: {order.priority}</p>
                {order.address_photo && (
                  <img src={order.address_photo} alt="Delivery address" className="mt-2 rounded-lg max-h-40 object-cover" />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button text="Close" color="stone" variant="outline" fullWidth onClick={onClose} />
              <Button
                text={deleting ? "Deleting..." : "Delete Order"}
                color="red"
                fullWidth
                disabled={deleting}
                onClick={this.handleDelete}
              />
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

export default OrderDetailModal;
