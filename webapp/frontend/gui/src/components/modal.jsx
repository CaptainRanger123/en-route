import { Component } from "react";

class Modal extends Component {
  static defaultProps = {
    maxWidth: "max-w-md",
  };

  render() {
    const { title, subtitle, onClose, children, maxWidth } = this.props;

    return (
      <div className="fixed inset-0 bg-stone-900/40 flex items-center justify-center px-4 z-20">
        <div className={`bg-white rounded-2xl shadow-lg w-full ${maxWidth} max-h-[85vh] overflow-y-auto`}>
          <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between sticky top-0 bg-white">
            <div>
              <h2 className="text-base font-semibold text-stone-900">{title}</h2>
              {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer">
              &times;
            </button>
          </div>

          <div className="px-6 py-5">
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
