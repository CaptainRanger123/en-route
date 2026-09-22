import Button from "./button";
import { Component } from "react";

class Navbar extends Component {
  render() {
    return (
      <header className="bg-white border-b border-gray-200">
        <nav className="mx-auto flex items-center justify-between p-5" aria-label="Global">
          <div className="flex items-center gap-4 lg:flex-1">
            <button 
              onClick={this.props.toggleSidebar}
              className="text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="#" className="-m-1.5 p-1.5 flex items-center">
              <img src="/static/logo.jpeg" alt="Agronix" className="h-10 w-auto" />
            </a>
          </div>

          <div className="flex flex-1 justify-end">
            <Button onClick={this.props.handleLogout} text="Logout" color="danger" />
          </div>
        </nav>
      </header>
    );
  }
}

export default Navbar;
