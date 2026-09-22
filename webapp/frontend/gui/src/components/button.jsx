import { Component } from "react";

const COLOR_STYLES = {
  danger: "bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
  info: "bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
  default: "bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
};

class Button extends Component {
  render() {
    const { fullwidth, formSubmit, onClick, text, color } = this.props;
    const colorClass = COLOR_STYLES[color] || COLOR_STYLES.default;

    return (
      <button
        type={formSubmit ? "submit" : "button"}
        form={formSubmit}
        onClick={onClick}
        className={`${fullwidth ? "w-full" : ""} px-5 py-2 rounded-lg font-semibold text-sm text-white cursor-pointer transition-colors shadow-sm ${colorClass}`}
      >
        {text}
      </button>
    );
  }
}

export default Button;
