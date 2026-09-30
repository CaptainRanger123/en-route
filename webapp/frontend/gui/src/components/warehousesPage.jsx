import { Component } from "react";

import AddWarehouseModal from "./addWarehouseModal.jsx";
import Button from "./button.jsx";

class WarehousesPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showAdd: false,
      editingWarehouse: null,
    };
  }

  handleAddSubmit = async data => {
    const success = await this.props.onAddWarehouse(data);
    if (success) this.setState({ showAdd: false });
  };

  handleEditSubmit = async data => {
    const success = await this.props.onUpdateWarehouse(this.state.editingWarehouse.id, data);
    if (success) this.setState({ editingWarehouse: null });
  };

  handleDelete = warehouse => {
    if (window.confirm(`Delete warehouse "${warehouse.name}"?`)) {
      this.props.onDeleteWarehouse(warehouse.id);
    }
  };

  render() {
    const { warehouses, loading, saving } = this.props;
    const { showAdd, editingWarehouse } = this.state;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Warehouses</h1>
            <p className="text-sm text-stone-500 mt-1">Warehouses used to stock products and dispatch riders.</p>
          </div>
          <Button text="Add Warehouse" color="coffee" onClick={() => this.setState({ showAdd: true })} />
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading warehouses...</p>
        ) : warehouses.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">No warehouses added yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Latitude</th>
                  <th className="px-5 py-3 font-medium">Longitude</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {warehouses.map(warehouse => (
                  <tr key={warehouse.id}>
                    <td className="px-5 py-3.5 text-stone-500">#{warehouse.id}</td>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{warehouse.name}</td>
                    <td className="px-5 py-3.5 text-stone-600">{warehouse.latitude}</td>
                    <td className="px-5 py-3.5 text-stone-600">{warehouse.longitude}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onClick={() => this.setState({ editingWarehouse: warehouse })} className="text-xs font-medium text-amber-800 hover:text-amber-900 cursor-pointer mr-4">
                        Edit
                      </button>
                      <button onClick={() => this.handleDelete(warehouse)} className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer">
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
          <AddWarehouseModal
            submitting={saving}
            onClose={() => this.setState({ showAdd: false })}
            onSubmit={this.handleAddSubmit}
          />
        )}

        {editingWarehouse && (
          <AddWarehouseModal
            warehouse={editingWarehouse}
            submitting={saving}
            onClose={() => this.setState({ editingWarehouse: null })}
            onSubmit={this.handleEditSubmit}
          />
        )}
      </div>
    );
  }
}

export default WarehousesPage;
