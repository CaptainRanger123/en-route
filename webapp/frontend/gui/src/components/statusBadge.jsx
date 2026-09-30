import { Component } from "react";

const STATUS_STYLES = {
  UNASSIGNED: "bg-stone-100 text-stone-600",
  ASSIGNED: "bg-blue-50 text-blue-700",
  IN_TRANSIT: "bg-amber-100 text-amber-800",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
};

class StatusBadge extends Component {
  render() {
    const { status } = this.props;
    const style = STATUS_STYLES[status] || "bg-stone-100 text-stone-600";

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${style}`}>
        {status.replace("_", " ")}
      </span>
    );
  }
}

export default StatusBadge;
