import { Component } from "react";

import StatusBadge from "./statusBadge.jsx";

class OrdersPage extends Component {
  render() {
    const { orders, loading } = this.props;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">My Orders</h1>
          <p className="text-sm text-stone-500 mt-1">Track the status of orders you've placed.</p>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Rider</th>
                  <th className="px-5 py-3 font-medium">Amount Paid</th>
                  <th className="px-5 py-3 font-medium">Delivery Address</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-5 py-3.5 text-stone-500">#{order.id}</td>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{order.product_name}</td>
                    <td className="px-5 py-3.5 text-stone-600">{order.rider_name || "Not yet assigned"}</td>
                    <td className="px-5 py-3.5 text-stone-900">₹{order.amt_paid.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-stone-500 max-w-xs truncate">{order.address || "-"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default OrdersPage;
