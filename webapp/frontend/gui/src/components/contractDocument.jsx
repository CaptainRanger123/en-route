import { Component } from "react";

import Button from "./button.jsx";

class ContractDocument extends Component {
  formatDate = value => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  renderPartyBlock = (title, party, isYou) => {
    return (
      <div className="flex-1 border border-gray-300 rounded-md p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
          {title} {isYou && <span className="text-emerald-600">(You)</span>}
        </h3>
        <p className="text-base font-semibold text-gray-900">{party.full_name || party.username}</p>
        <p className="text-sm text-gray-600 mt-1">Username: {party.username}</p>
        <p className="text-sm text-gray-600">Address: {party.address || "-"}</p>
        <p className="text-sm text-gray-600">Phone: {party.phone || "-"}</p>
        <p className="text-sm text-gray-600">Email: {party.email || "-"}</p>
      </div>
    );
  }

  render() {
    const { trade, onClose } = this.props;

    if (!trade) {
      return null;
    }

    const contractNo = `AGX-${String(trade.id).padStart(6, "0")}`;
    const totalValue = (trade.qty * trade.price).toFixed(2);

    return (
      <div>
        <div className="flex items-center justify-between mb-4 print:hidden">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Contracts
          </button>

          <Button onClick={() => window.print()} text="Export to PDF" color="default" />
        </div>

        <div className="printable-contract bg-white border border-gray-300 rounded-xl shadow-sm p-8 font-serif text-gray-900 max-w-3xl mx-auto">
          <div className="text-center border-b border-gray-300 pb-4 mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-wide">Agricultural Forward Contract</h1>
            <p className="text-sm text-gray-500 mt-1">Contract No: {contractNo}</p>
            <p className="text-sm text-gray-500">Executed on: {this.formatDate(trade.executed_at)}</p>
          </div>

          <p className="text-sm text-gray-700 mb-6 leading-relaxed">
            This Agricultural Forward Contract ("Contract") is entered into on the date stated above, by and between
            the Seller (Farmer) and the Buyer named below, through the AGRONIX exchange platform, for the sale and
            purchase of the agricultural commodity described herein, subject to the terms and conditions set out below.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {this.renderPartyBlock("Seller (Farmer)", trade.farmer, trade.your_role === "FARMER")}
            {this.renderPartyBlock("Buyer", trade.buyer, trade.your_role === "BUYER")}
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Contract Terms</h3>
          <table className="w-full text-sm mb-6 border border-gray-300">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 font-semibold text-gray-600 w-1/2">Commodity</td>
                <td className="px-3 py-2">{trade.crop}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 font-semibold text-gray-600">Quantity</td>
                <td className="px-3 py-2">{trade.qty} kg</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 font-semibold text-gray-600">Delivery Month</td>
                <td className="px-3 py-2">{trade.delivery_month}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-3 py-2 font-semibold text-gray-600">Price per kg</td>
                <td className="px-3 py-2">₹{Number(trade.price).toFixed(2)} / kg</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-gray-600">Total Contract Value</td>
                <td className="px-3 py-2 font-bold">₹{totalValue}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-xs text-gray-500 mb-10 leading-relaxed">
            Both parties agree to honor the delivery and payment terms stated above. This document is generated
            electronically by the AGRONIX platform upon execution of the matching trade and serves as evidence of
            the agreement between the parties. Signatures below indicate acknowledgement of the terms herein.
          </p>

          <div className="flex flex-col md:flex-row gap-10 mt-4">
            <div className="flex-1">
              <div className="border-t border-gray-400 pt-2 mt-10 text-sm text-gray-600">
                Seller's Signature ({trade.farmer.full_name || trade.farmer.username})
              </div>
            </div>
            <div className="flex-1">
              <div className="border-t border-gray-400 pt-2 mt-10 text-sm text-gray-600">
                Buyer's Signature ({trade.buyer.full_name || trade.buyer.username})
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContractDocument;
