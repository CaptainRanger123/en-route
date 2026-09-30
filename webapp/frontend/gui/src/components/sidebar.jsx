import { Component } from "react";

import Button from "./button.jsx";

const NAV_ITEMS = [
  { key: "products", label: "Products" },
  { key: "warehouses", label: "Warehouses" },
  { key: "riders", label: "Riders" },
  { key: "map", label: "Map" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "logs", label: "Logs" },
]

class Sidebar extends Component {
  render() {
    const { page, onNavigate, username, onLogout } = this.props;

    return (
      <aside className="w-60 shrink-0 bg-white border-r border-amber-200 min-h-screen flex flex-col sticky top-0">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-amber-200">
          <img src="/logo1.png" alt="En Route" className="w-45" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                page === item.key
                  ? "bg-amber-100 text-amber-900"
                  : "text-stone-500 hover:text-stone-800 hover:bg-amber-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-amber-200">
          <p className="text-xs text-stone-500 mb-2 truncate">
            {username ? `Signed in as ${username}` : "Dispatcher"}
          </p>
          <Button text="Log out" color="stone" variant="outline" fullWidth onClick={onLogout} />
        </div>
      </aside>
    );
  }
}

export default Sidebar;
