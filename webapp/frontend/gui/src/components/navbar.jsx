import { Component } from "react";

import Button from "./button.jsx";

const TABS = [
  { key: "products", label: "Products" },
  { key: "orders", label: "My Orders" },
];

class Navbar extends Component {
  render() {
    const { username, page, onNavigate, onLogout } = this.props;

    return (
      <header className="bg-white border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <img src="/static/logo1.png" alt="En Route" className="w-45" />

          <div className="flex items-center gap-8">
            {/* <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-800 text-white flex items-center justify-center text-sm font-bold">
                E
              </div>
              <span className="font-semibold text-stone-900">En Route</span>
            </div> */}
            {/* <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-800 text-white text-xl font-bold mb-3"></div> */}
            <nav className="flex items-center gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => onNavigate(tab.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    page === tab.key
                      ? "bg-amber-100 text-amber-900"
                      : "text-stone-500 hover:text-stone-800 hover:bg-amber-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500 hidden sm:inline">
              {username ? `Hi, ${username}` : "Welcome"}
            </span>
            <Button text="Log out" color="stone" variant="outline" onClick={onLogout} />
          </div>
        </div>
      </header>
    );
  }
}

export default Navbar;
