import { Component } from "react";

import StatusBadge from "./statusBadge.jsx";

class DispatcherOrdersPage extends Component {
  render() {
    const { orders, loading, onViewOrder } = this.props;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Orders</h1>
          <p className="text-sm text-stone-500 mt-1">All orders placed by customers.</p>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">No orders have been placed yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Rider</th>
                  <th className="px-5 py-3 font-medium">Amount Paid</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-5 py-3.5 text-stone-500">#{order.id}</td>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{order.customer_name}</td>
                    <td className="px-5 py-3.5 text-stone-600">{order.product_name}</td>
                    <td className="px-5 py-3.5 text-stone-600">{order.rider_name || "Not yet assigned"}</td>
                    <td className="px-5 py-3.5 text-stone-900">₹{order.amt_paid.toFixed(2)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onViewOrder(order.id)}
                        className="text-xs font-medium text-amber-800 hover:text-amber-900 cursor-pointer"
                      >
                        View
                      </button>
                    </td>
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

export default DispatcherOrdersPage;
