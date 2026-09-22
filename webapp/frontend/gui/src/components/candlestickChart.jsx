import { Component, createRef } from "react";
import { createChart, CandlestickSeries, ColorType } from "lightweight-charts";

class CandlestickChart extends Component {
  constructor(props) {
    super(props);

    this.containerRef = createRef();
    this.chart = null;
    this.series = null;
  }

  componentDidMount() {
    this.initChart();
    window.addEventListener("resize", this.handleResize);
  }

  componentDidUpdate(prevProps) {
    if (!this.series || prevProps.data === this.props.data) {
      return;
    }

    this.series.setData(this.props.data);

    if (prevProps.crop !== this.props.crop) {
      this.chart.timeScale().fitContent();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);

    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.series = null;
    }
  }

  handleResize = () => {
    if (this.chart && this.containerRef.current) {
      this.chart.applyOptions({ width: this.containerRef.current.clientWidth });
    }
  }

  initChart = () => {
    const container = this.containerRef.current;

    if (!container) {
      return;
    }

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#4b5563",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
      },
      crosshair: {
        mode: 0,
      },
    });

    this.series = this.chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });

    if (this.props.data && this.props.data.length > 0) {
      this.series.setData(this.props.data);
      this.chart.timeScale().fitContent();
    }
  }

  render() {
    return <div ref={this.containerRef} className="w-full" />;
  }
}

export default CandlestickChart;
