import { Component } from "react";

class MarketWatch extends Component {
  formatNumber = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "-";
    }

    return Number(value).toFixed(decimals);
  }

  render() {
    const { crops, selectedCrop, onSelectCrop } = this.props;

    if (!crops || crops.length === 0) {
      return <div className="p-6 text-center text-gray-400 text-sm">Loading market data...</div>;
    }

    return (
      <div className="divide-y divide-gray-100">
        {crops.map(c => {
          const isPositive = c.change >= 0;
          const isSelected = selectedCrop === c.crop;

          return (
            <div
              key={c.crop}
              onClick={() => onSelectCrop(c.crop)}
              className={`px-3 py-2.5 cursor-pointer border-l-2 transition-colors ${isSelected ? "bg-emerald-50 border-emerald-500" : "border-transparent hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{c.crop}</span>
                <span className="text-sm font-semibold text-gray-900">₹{this.formatNumber(c.ltp)}/kg</span>
              </div>

              <div className="flex items-center justify-between mt-0.5">
                <span className={`text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                  {isPositive ? "+" : ""}{this.formatNumber(c.change)} ({isPositive ? "+" : ""}{this.formatNumber(c.change_percent)}%)
                </span>
                <span className="text-xs text-gray-400">Vol {c.volume} kg</span>
              </div>

              <div className="grid grid-cols-4 gap-1 mt-1.5 text-[11px] text-gray-400">
                <div>O <span className="text-gray-600">{this.formatNumber(c.open)}</span></div>
                <div>H <span className="text-gray-600">{this.formatNumber(c.high)}</span></div>
                <div>L <span className="text-gray-600">{this.formatNumber(c.low)}</span></div>
                <div>C <span className="text-gray-600">{this.formatNumber(c.close)}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default MarketWatch;
