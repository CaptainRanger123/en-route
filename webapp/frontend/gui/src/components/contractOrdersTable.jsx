import { Component } from "react";

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PARTIALLY_FILLED: "bg-blue-100 text-blue-700",
  FILLED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

class ContractOrdersTable extends Component {
  formatDate = value => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  }

  render() {
    const { orders } = this.props;

    if (!orders || orders.length === 0) {
      return <div className="p-6 text-center text-gray-400 text-sm">No contract orders placed yet.</div>;
    }

    return (
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
            <th className="px-3 py-3">Date</th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Crop</th>
            <th className="px-3 py-3">Qty (kg)</th>
            <th className="px-3 py-3">Filled (kg)</th>
            <th className="px-3 py-3">Delivery</th>
            <th className="px-3 py-3">Limit Price (₹/kg)</th>
            <th className="px-3 py-3">Executed Price (₹/kg)</th>
            <th className="px-3 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{this.formatDate(order.created_at)}</td>
              <td className={`px-3 py-3 font-semibold ${order.trade_type === "BUY" ? "text-emerald-600" : "text-red-600"}`}>
                {order.trade_type}
              </td>
              <td className="px-3 py-3 text-gray-900 font-medium">{order.crop}</td>
              <td className="px-3 py-3 text-gray-600">{order.qty}</td>
              <td className="px-3 py-3 text-gray-600">{order.filled_qty} / {order.qty}</td>
              <td className="px-3 py-3 text-gray-600">{order.delivery_month}</td>
              <td className="px-3 py-3 text-gray-600">₹{Number(order.limit_price).toFixed(2)}</td>
              <td className="px-3 py-3 text-gray-600">₹{Number(order.executed_price).toFixed(2)}</td>
              <td className="px-3 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default ContractOrdersTable;
