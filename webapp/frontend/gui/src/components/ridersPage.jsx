import { Component } from "react";

import AddRiderModal from "./addRiderModal.jsx";
import Button from "./button.jsx";

const RIDER_STATUS_STYLES = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  ON_DELIVERY: "bg-amber-100 text-amber-800",
  OFFLINE: "bg-stone-100 text-stone-600",
};

class RidersPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showAdd: false,
      editingRider: null,
    };
  }

  handleAddSubmit = async data => {
    const success = await this.props.onAddRider(data);
    if (success) this.setState({ showAdd: false });
  };

  handleEditSubmit = async data => {
    const success = await this.props.onUpdateRider(this.state.editingRider.id, data);
    if (success) this.setState({ editingRider: null });
  };

  handleDelete = rider => {
    if (window.confirm(`Delete rider "${rider.name}"?`)) {
      this.props.onDeleteRider(rider.id);
    }
  };

  render() {
    const { riders, warehouses, loading, saving } = this.props;
    const { showAdd, editingRider } = this.state;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Riders</h1>
            <p className="text-sm text-stone-500 mt-1">Riders available to deliver orders to customers.</p>
          </div>
          <Button text="Add Rider" color="coffee" onClick={() => this.setState({ showAdd: true })} />
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading riders...</p>
        ) : riders.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">No riders added yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Max Capacity</th>
                  <th className="px-5 py-3 font-medium">Stuck</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {riders.map(rider => (
                  <tr key={rider.id}>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{rider.name}</td>
                    <td className="px-5 py-3.5 text-stone-600">{rider.phone}</td>
                    <td className="px-5 py-3.5 text-stone-600">{rider.email}</td>
                    <td className="px-5 py-3.5 text-stone-600">{rider.max_capacity}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                        rider.is_stuck ? "bg-red-50 text-red-600" : "bg-stone-100 text-stone-600"
                      }`}>
                        {rider.is_stuck ? "Stuck" : "No"}
                      </span>
                    </td>
                    {/* <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                        RIDER_STATUS_STYLES[rider.status] || "bg-stone-100 text-stone-600"
                      }`}>
                        {rider.status.replace("_", " ")}
                      </span>
                    </td> */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onClick={() => this.setState({ editingRider: rider })} className="text-xs font-medium text-amber-800 hover:text-amber-900 cursor-pointer mr-4">
                        Edit
                      </button>
                      <button onClick={() => this.handleDelete(rider)} className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer">
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
          <AddRiderModal
            warehouses={warehouses}
            submitting={saving}
            onClose={() => this.setState({ showAdd: false })}
            onSubmit={this.handleAddSubmit}
          />
        )}

        {editingRider && (
          <AddRiderModal
            rider={editingRider}
            warehouses={warehouses}
            submitting={saving}
            onClose={() => this.setState({ editingRider: null })}
            onSubmit={this.handleEditSubmit}
          />
        )}
      </div>
    );
  }
}

export default RidersPage;
