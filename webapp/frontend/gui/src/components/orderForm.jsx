import { Component } from "react";

import Button from "./button.jsx";

const DEFAULT_CROPS = ["WHEAT", "RICE", "COTTON", "POTATO"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

class OrderForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      crop: DEFAULT_CROPS[0],
      qty: "",
      deliveryMonth: MONTHS[0],
      limitPrice: "",
    }
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit = e => {
    e.preventDefault();

    if (!this.state.qty || !this.state.limitPrice) {
      return;
    }

    this.props.onSubmit({
      crop: this.state.crop,
      qty: parseInt(this.state.qty, 10),
      deliveryMonth: this.state.deliveryMonth,
      limitPrice: parseFloat(this.state.limitPrice),
    });

    this.setState({ qty: "", limitPrice: "" });
  }

  render() {
    const { accType, submitting } = this.props;
    const isFarmer = accType === "FARMER";
    const orderLabel = isFarmer ? "Sell" : "Buy";
    const cropOptions = this.props.crops && this.props.crops.length > 0 ? this.props.crops : DEFAULT_CROPS;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Place {orderLabel} Order</h2>
          <p className="text-xs text-gray-400 mt-1">
            {isFarmer ? "List your produce for sale via a forward contract" : "Buy crops via a forward contract"}
          </p>
        </div>

        <form className="p-4 flex flex-col gap-4 flex-1" onSubmit={this.handleSubmit} id="order-form">
          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="crop">Crop</label>
            <select
              name="crop" id="crop" value={this.state.crop} onChange={this.handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {cropOptions.map(crop => <option key={crop} value={crop}>{crop}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="qty">Quantity (kg)</label>
            <input
              type="number" min="1" name="qty" id="qty" placeholder="Enter quantity in kg"
              value={this.state.qty} onChange={this.handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="deliveryMonth">Delivery Month</label>
            <select
              name="deliveryMonth" id="deliveryMonth" value={this.state.deliveryMonth} onChange={this.handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="limitPrice">Limit Price (₹/kg)</label>
            <input
              type="number" min="0" step="0.01" name="limitPrice" id="limitPrice" placeholder="Enter limit price per kg"
              value={this.state.limitPrice} onChange={this.handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </form>

        <div className="px-4 pb-4">
          <Button
            formSubmit="order-form"
            fullwidth={true}
            text={submitting ? "Placing..." : `Place ${orderLabel} Order`}
            color={isFarmer ? "danger" : "info"}
          />
        </div>
      </div>
    );
  }
}

export default OrderForm;
