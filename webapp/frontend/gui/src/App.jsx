import "./App.css";
import Cookies from "js-cookie";
import { Component } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

// Components
import MainPage from "./components/mainPage.jsx";
import LoginForm from "./components/loginForm.jsx";


const options = {
  position: "bottom-right",
  pauseOnHover: true,
  closeOnClick: true,
  theme: "dark",
  autoClose: 2500
}

class App extends Component {
  constructor(props) {
    super(props);

    console.log(process.env.NODE_ENV);
    this.URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";

    console.log(this.URL);

    this.state = {
      loggedIn: localStorage.getItem("jwt-token") ? true : false,
      username: "",
      accType: ""
    }
  }

  request = async (route, method, body=null, logoutOnElse=true, msgOnSuccess=true) => {
    let res;

    if (method === "POST") {
      res = await fetch(`${this.URL}/api/${route}`, {
        method: method,
        headers: {
          "Authorization": `jwt-token ${localStorage.getItem("jwt-token")}`,
          "X-CSRFToken": this.getCsrfCookie()
        },
        body: JSON.stringify(body)
      });
    } else {
      res = await fetch(`${this.URL}/api/${route}`, {
        method: method,
        headers: {
          "Authorization": `jwt-token ${localStorage.getItem("jwt-token")}`,
          "X-CSRFToken": this.getCsrfCookie()
        }
      });
    }

    const json = await res.json();
    console.log(json);

    if (json.type === "success") {
      if (msgOnSuccess) {
        toast.success(`Success: ${json.message}`, options);
      }

      return json

    } else if (json.type === "info") {
      if (msgOnSuccess) {
        toast.info(`Success: ${json.message}`, options);
      }

      return json

    } else if (json.type === "error") {
      toast.error(`Error: ${json.message}`, options);

      return json

    } else if (json.type === "generateToken") {
      console.log(`Redirecting to ${json.url}`);
      window.location = json.url;

      return json

    } else {
      toast.error(`${json.type}: ${json.message}`, options);
      if (logoutOnElse) {
        toast.error("Logged out!", options);
        this.handleLogout();
      }

      return json
    }
  }

  componentDidMount = async () => {
    if (this.state.loggedIn) {
      const json = await this.request("dispatcher-current-user/", "GET");

      if (json.type === "success") {
        this.setState({
          username: json.username,
          accType: json.acc_type
        });
      }
    }
  }

  getCsrfCookie = () => {
    return Cookies.get("csrftoken");
  }

  handleLogin = async data => {
    console.log(data);
    const json = await this.request("login/", "POST", data, false);

    if (json.type === "success") {
      localStorage.setItem("jwt-token", json.jwtToken);
      this.setState({loggedIn: true});

      const username_json = await this.request("current-user/", "GET");

      if (username_json.type === "success") {
        this.setState({
          username: username_json.username,
          accType: username_json.acc_type
        });
      }
    }
  }

  handleLogout = () => {
    localStorage.removeItem("jwt-token");
    this.setState({loggedIn: false});
    toast.info("Logged out!", options);
  }

  render() {
    let page = null;

    if (!this.state.loggedIn) {
      page = <LoginForm
        handleLogin={this.handleLogin}
      />

    } else {
      page = <MainPage
        URL={this.URL}
        request={this.request}
        username={this.state.username}
        accType={this.state.accType}
        handleLogout={this.handleLogout}
      />
    }

    return (
      <div className="App">
        {page}
        {/* <ToastContainer /> */}
      </div>
    );
  }
}

export default App;