import { Component } from "react";

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.navigation = [
      {
        page: 1,
        title: "",
        items: [
          { subPage: 1, label: "Dashboard" },
          { subPage: 3, label: "Contracts" },
          { subPage: 2, label: "Profile" },
        ]
      }
    ];
  }

  render() {
    const { isOpen, onClose, onNavigate, currentSubPage } = this.props;

    return (
      <>
        {/* Overlay for mobile/when open */}
        <div 
          className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
        />

        {/* Sidebar Panel */}
        <div className={`fixed top-0 left-0 h-full w-72 bg-white text-gray-800 z-50 transform transition-transform duration-300 shadow-xl border-r border-gray-200 overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-5 flex justify-between items-center border-b border-gray-200">
            <h2 className="text-xl font-bold text-emerald-600">AGRONIX</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            {this.navigation.map((group) => (
              <div key={group.page} className="mb-6">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3 pl-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = currentSubPage === item.subPage;
                    return (
                      <button
                        key={item.subPage}
                        onClick={() => onNavigate(group.page, item.subPage)}
                        className={`w-full text-left cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? "bg-emerald-500 text-white" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default Sidebar;
