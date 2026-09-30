import { Component } from "react";

class Button extends Component {
  static defaultProps = {
    type: "button",
    color: "coffee",
    variant: "solid",
    fullWidth: false,
    disabled: false,
  }

  render() {
    const { text, onClick, type, formSubmit, color, variant, fullWidth, disabled } = this.props;

    const base = "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-4 py-2.5 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const colors = {
      coffee: variant === "solid"
        ? "bg-amber-800 text-white hover:bg-amber-900"
        : "bg-white text-amber-900 border border-amber-300 hover:bg-amber-50",
      stone: variant === "solid"
        ? "bg-stone-800 text-white hover:bg-stone-900"
        : "bg-white text-stone-700 border border-stone-300 hover:bg-stone-50",
      red: variant === "solid"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-white text-red-600 border border-red-200 hover:bg-red-50",
    }

    return (
      <button
        type={formSubmit ? "submit" : type}
        form={formSubmit || undefined}
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${colors[color]} ${fullWidth ? "w-full" : ""}`}
      >
        {text}
      </button>
    );
  }
}

export default Button;
