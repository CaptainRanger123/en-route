import { Component } from "react";

import ContractDocument from "./contractDocument.jsx";

const REFRESH_INTERVAL_MS = 5000;

class Contracts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contracts: [],
      selectedContractId: null,
      loading: true,
      updateIntervalID: null,
    }
  }

  async componentDidMount() {
    await this.fetchContracts();
    this.setState({ loading: false });

    const intervalID = setInterval(this.fetchContracts, REFRESH_INTERVAL_MS);
    this.setState({ updateIntervalID: intervalID });
  }

  componentWillUnmount() {
    clearInterval(this.state.updateIntervalID);
  }

  fetchContracts = async () => {
    const json = await this.props.request("contracts/", "GET", null, true, false);

    if (json.type === "success") {
      this.setState({ contracts: json.data });
    }
  }

  formatDate = value => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  }

  handleSelect = id => {
    this.setState({ selectedContractId: id });
  }

  handleClose = () => {
    this.setState({ selectedContractId: null });
  }

  render() {
    const { contracts, selectedContractId, loading } = this.state;

    if (selectedContractId !== null) {
      const trade = contracts.find(c => c.id === selectedContractId);

      return (
        <div className="max-w-7xl mx-auto">
          <ContractDocument trade={trade} onClose={this.handleClose} />
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Contracts</h2>
            <p className="text-xs text-gray-400 mt-1">
              Legal documents for your filled trades. Select one to view and export it as a PDF.
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No filled contracts yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                    <th className="px-3 py-3">Contract No.</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Crop</th>
                    <th className="px-3 py-3">Qty (kg)</th>
                    <th className="px-3 py-3">Price (₹/kg)</th>
                    <th className="px-3 py-3">Your Role</th>
                    <th className="px-3 py-3">Counterparty</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(contract => {
                    const counterparty = contract.your_role === "FARMER" ? contract.buyer : contract.farmer;

                    return (
                      <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                          AGX-{String(contract.id).padStart(6, "0")}
                        </td>
                        <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{this.formatDate(contract.executed_at)}</td>
                        <td className="px-3 py-3 text-gray-900 font-medium">{contract.crop}</td>
                        <td className="px-3 py-3 text-gray-600">{contract.qty}</td>
                        <td className="px-3 py-3 text-gray-600">₹{Number(contract.price).toFixed(2)}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contract.your_role === "FARMER" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {contract.your_role}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{counterparty.full_name || counterparty.username}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => this.handleSelect(contract.id)}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                          >
                            View / Export
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
      </div>
    );
  }
}

export default Contracts;
