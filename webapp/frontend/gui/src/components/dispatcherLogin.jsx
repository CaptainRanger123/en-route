import { Component } from "react";

import Button from "./button.jsx";

class DispatcherLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
    };
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = e => {
    e.preventDefault();

    if (!this.state.username || !this.state.password) {
      return;
    }

    this.props.onLogin(this.state);
  };

  render() {
    const { loading } = this.props;
    const { username, password } = this.state;

    return (
      <div className="w-full max-w-sm">
        <form onSubmit={this.handleSubmit} className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="dispatcher-username" className="block text-xs font-medium text-stone-600 mb-1">
              Username
            </label>
            <input
              id="dispatcher-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={this.handleChange}
              placeholder="Enter your username"
              className="w-full px-3 py-2.5 rounded-lg border border-amber-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
            />
          </div>

          <div>
            <label htmlFor="dispatcher-password" className="block text-xs font-medium text-stone-600 mb-1">
              Password
            </label>
            <input
              id="dispatcher-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={this.handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 rounded-lg border border-amber-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600"
            />
          </div>

          <Button
            text={loading ? "Signing in..." : "Sign in"}
            type="submit"
            color="coffee"
            fullWidth
            disabled={loading}
          />
        </form>

        <p className="text-xs text-center text-stone-400 mt-6">Dispatcher Portal &middot; En Route Deliveries</p>
      </div>
    );
  }
}

export default DispatcherLogin;
