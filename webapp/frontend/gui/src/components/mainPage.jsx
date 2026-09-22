import { Component } from "react";

import Navbar from "./navbar.jsx";
import Sidebar from "./sidebar.jsx";
import Dashboard from "./dashboard.jsx";
import Profile from "./profile.jsx";
import Contracts from "./contracts.jsx";

class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 1,
      subPage: 1,
      isSidebarOpen: false,
    }
  }

  toggleSidebar = () => {
    this.setState(prevState => ({
      isSidebarOpen: !prevState.isSidebarOpen
    }));
  }

  handleSidebarNavigation = (page, subPage) => {
    this.setState({
      currentPage: page,
      subPage: subPage,
      isSidebarOpen: false
    });
  }

  renderContent = () => {
    if (this.state.subPage === 1) {
      return (
        <Dashboard
          request={this.props.request}
          accType={this.props.accType}
        />
      );
    }

    if (this.state.subPage === 2) {
      return (
        <Profile
          request={this.props.request}
          accType={this.props.accType}
          username={this.props.username}
        />
      );
    }

    if (this.state.subPage === 3) {
      return (
        <Contracts
          request={this.props.request}
          accType={this.props.accType}
          username={this.props.username}
        />
      );
    }

    return null;
  }

  render() {
    return (
      <div>
        <Navbar
          toggleSidebar={this.toggleSidebar}
          username={this.props.username}
          handleLogout={this.props.handleLogout}
        />

        <Sidebar
          isOpen={this.state.isSidebarOpen}
          onClose={() => this.setState({ isSidebarOpen: false })}
          onNavigate={this.handleSidebarNavigation}
          currentSubPage={this.state.subPage}
        />

        <div className="p-4 md:p-6">
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default MainPage;
