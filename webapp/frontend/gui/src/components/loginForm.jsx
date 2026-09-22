import Button from "./button";
import { Component } from "react";

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    }
  }

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    this.setState(prevstate => {
      const newState = { ...prevstate };
      newState[name] = value;
      return newState;
    });
  }

  handleLoginFormSubmit = e => {
    e.preventDefault();
    this.props.handleLogin(this.state);
  }

  render() {
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-lg p-4 bg-white shadow-md mt-40 max-w-full w-3xl">
          <div className="flex flex-col items-center">
            <img width="150" src="/static/login_logo.png" alt="User Logo" className="login-logo mb-5" />
          </div>

          <h3 className="text-3xl font-extrabold text-center mb-3">Welcome back, please login</h3>
          <form className="p-2 has-text-left" onSubmit={this.handleLoginFormSubmit} id="login-form">
            <div className="mb-3">
              <label className="text-xl" htmlFor="username">Username:</label>
              <div className="mt-2 mb-3">
                <input
                  autofocus class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  placeholder="Username" name="username" id="username"
                  onChange={this.handleChange} value={this.state.username}
                />
              </div>

              <label className="text-xl" htmlFor="password-input">Password:</label>
              <div className="mt-2">
                <input
                  class="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password" placeholder="Password" name="password" id="password"
                  onChange={this.handleChange} value={this.state.password}
                />
              </div>
            </div>
          </form>

          <Button formSubmit="login-form" fullwidth={true} text="Log in" />
        </div>
      </div>
    );
  }
}

export default LoginForm;
