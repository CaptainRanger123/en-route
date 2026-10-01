import { Component } from "react";

import StatusBadge from "./statusBadge.jsx";

class DispatcherOrdersPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRiders: {},
    };
  }

  handleRiderChange = (orderId, riderId) => {
    this.setState(prev => ({
      selectedRiders: { ...prev.selectedRiders, [orderId]: riderId },
    }));
  }

  handleManualAssign = orderId => {
    const riderId = this.state.selectedRiders[orderId];

    if (!riderId) {
      return;
    }

    this.props.onAssignManual(orderId, riderId);
  }

  render() {
    const { orders, riders, loading, assigningOrderId, onViewOrder, onAssignAuto } = this.props;
    const { selectedRiders } = this.state;

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
                  <th className="px-5 py-3 font-medium">Assign</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {orders.map(order => {
                  const isUnassigned = order.status === "UNASSIGNED";
                  const busy = assigningOrderId === order.id;

                  return (
                    <tr key={order.id}>
                      <td className="px-5 py-3.5 text-stone-500">#{order.id}</td>
                      <td className="px-5 py-3.5 font-medium text-stone-900">{order.customer_name}</td>
                      <td className="px-5 py-3.5 text-stone-600">{order.product_name}</td>
                      <td className="px-5 py-3.5 text-stone-600">{order.rider_name || "Not yet assigned"}</td>
                      <td className="px-5 py-3.5 text-stone-900">₹{order.amt_paid.toFixed(2)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-3.5">
                        {isUnassigned ? (
                          <div className="flex flex-col gap-2 min-w-[16rem]">
                            <select
                              value={selectedRiders[order.id] || ""}
                              onChange={e => this.handleRiderChange(order.id, e.target.value)}
                              disabled={busy}
                              className="w-full px-2 py-1.5 rounded-lg border border-amber-300 text-xs text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 disabled:opacity-50"
                            >
                              <option value="">Select a rider</option>
                              {riders.map(rider => (
                                <option key={rider.id} value={rider.id}>
                                  {rider.name}{rider.status ? ` (${rider.status.replace("_", " ")})` : ""}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={busy || !selectedRiders[order.id]}
                                onClick={() => this.handleManualAssign(order.id)}
                                className="flex-1 text-xs font-medium px-2 py-1.5 rounded-lg bg-amber-800 text-white hover:bg-amber-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {busy ? "Assigning..." : "Assign"}
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => onAssignAuto(order.id)}
                                className="flex-1 text-xs font-medium px-2 py-1.5 rounded-lg bg-white text-amber-900 border border-amber-300 hover:bg-amber-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Auto
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => onViewOrder(order.id)}
                          className="text-xs font-medium text-amber-800 hover:text-amber-900 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default DispatcherOrdersPage;
