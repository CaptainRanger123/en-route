import { Component } from "react";

import OrderForm from "./orderForm.jsx";
import MarketWatch from "./marketWatch.jsx";
import CandlestickChart from "./candlestickChart.jsx";
import ContractOrdersTable from "./contractOrdersTable.jsx";

const REFRESH_INTERVAL_MS = 5000;

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      crops: [],
      selectedCrop: null,
      candles: [],
      contractOrders: [],
      isSubmittingOrder: false,
      updateIntervalID: null,
    }
  }

  async componentDidMount() {
    await this.fetchCrops();
    await this.fetchContractOrders();

    if (this.state.selectedCrop) {
      await this.fetchCandles(this.state.selectedCrop);
    }

    const intervalID = setInterval(this.refreshData, REFRESH_INTERVAL_MS);
    this.setState({ updateIntervalID: intervalID });
  }

  componentWillUnmount() {
    clearInterval(this.state.updateIntervalID);
  }

  refreshData = async () => {
    await this.fetchCrops();
    await this.fetchContractOrders();

    if (this.state.selectedCrop) {
      await this.fetchCandles(this.state.selectedCrop);
    }
  }

  fetchCrops = async () => {
    const json = await this.props.request("crops/", "GET", null, true, false);

    if (json.type === "success") {
      this.setState(prevState => ({
        crops: json.data,
        selectedCrop: prevState.selectedCrop || (json.data.length > 0 ? json.data[0].crop : null)
      }));
    }
  }

  fetchContractOrders = async () => {
    const json = await this.props.request("contract-orders/", "GET", null, true, false);

    if (json.type === "success") {
      this.setState({ contractOrders: json.data });
    }
  }

  fetchCandles = async crop => {
    const json = await this.props.request(`crop/candles/${crop}/`, "GET", null, true, false);

    if (json.type === "success") {
      const candles = json.data.candles.map(c => ({
        time: Math.floor(new Date(c.timestamp).getTime() / 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      this.setState({ candles });
    }
  }

  handleSelectCrop = crop => {
    this.setState({ selectedCrop: crop });
    this.fetchCandles(crop);
  }

  handlePlaceOrder = async orderData => {
    this.setState({ isSubmittingOrder: true });

    const tradeType = this.props.accType === "FARMER" ? "SELL" : "BUY";

    await this.props.request("contract-order/place/", "POST", {
      trade_type: tradeType,
      crop: orderData.crop,
      qty: orderData.qty,
      delivery_month: orderData.deliveryMonth,
      limit_price: orderData.limitPrice,
    });

    this.setState({ isSubmittingOrder: false });
    await this.fetchContractOrders();
  }

  render() {
    const { crops, selectedCrop, candles, contractOrders, isSubmittingOrder } = this.state;
    const { accType } = this.props;

    const selectedCropData = crops.find(c => c.crop === selectedCrop);

    return (
      <div className="flex flex-col gap-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Market Watch</h2>
              </div>
              <MarketWatch
                crops={crops}
                selectedCrop={selectedCrop}
                onSelectCrop={this.handleSelectCrop}
              />
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  {selectedCrop ? `${selectedCrop} - Candlestick Chart` : "Candlestick Chart"}
                </h2>
                {selectedCropData && (
                  <div className="text-sm text-gray-500">
                    LTP: <span className="text-gray-900 font-semibold">₹{Number(selectedCropData.ltp).toFixed(2)}/kg</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                {candles.length > 0 ? (
                  <CandlestickChart data={candles} crop={selectedCrop} />
                ) : (
                  <div className="h-[420px] flex items-center justify-center text-gray-400 text-sm">
                    {selectedCrop ? "Loading chart data..." : "Select a crop to view its chart"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 order-3">
            <OrderForm
              accType={accType}
              crops={crops.map(c => c.crop)}
              onSubmit={this.handlePlaceOrder}
              submitting={isSubmittingOrder}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Contract Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <ContractOrdersTable orders={contractOrders} />
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
