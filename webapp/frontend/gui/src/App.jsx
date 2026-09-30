import "./App.css";
import Cookies from "js-cookie";
import { Component } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import CustomerLogin from "./components/customerLogin.jsx";
import DispatcherLogin from "./components/dispatcherLogin.jsx";
import Navbar from "./components/navbar.jsx";
import ProductsPage from "./components/productsPage.jsx";
import OrdersPage from "./components/ordersPage.jsx";
import DispatcherDashboard from "./components/dispatcherDashboard.jsx";

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

    this.URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";

    this.state = {
      loggedIn: localStorage.getItem("jwt-token") ? true : false,
      role: localStorage.getItem("role") || "",
      username: localStorage.getItem("username") || "",

      authTab: "customer",
      page: "products",

      products: [],
      orders: [],

      loggingIn: false,
      loadingProducts: false,
      loadingOrders: false,
      placingOrder: false,
    }
  }

  request = async (route, method, body=null, logoutOnElse=true, msgOnSuccess=true) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const headers = {
      "Authorization": `jwt-token ${localStorage.getItem("jwt-token")}`,
      "X-CSRFToken": this.getCsrfCookie()
    };

    // Let the browser set Content-Type (with boundary) for multipart uploads
    if (!isFormData && (method === "POST" || method === "PUT" || method === "DELETE")) {
      headers["Content-Type"] = "application/json";
    }

    let res;

    if (method === "POST" || method === "PUT" || method === "DELETE") {
      res = await fetch(`${this.URL}/api/${route}`, {
        method: method,
        headers,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
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

    if (json.type === "success") {
      if (msgOnSuccess && json.message) {
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
    if (this.state.loggedIn && this.state.role === "customer") {
      this.fetchProducts();
    }
  }

  getCsrfCookie = () => {
    return Cookies.get("csrftoken");
  }

  fetchProducts = async () => {
    this.setState({loadingProducts: true});

    const json = await this.request("product-list/", "GET", null, true, false);

    if (json.type === "success") {
      this.setState({products: json.data});
    }

    this.setState({loadingProducts: false});
  }

  fetchOrders = async () => {
    this.setState({loadingOrders: true});

    const json = await this.request("customer-order-list/", "GET", null, true, false);

    if (json.type === "success") {
      this.setState({orders: json.data});
    }

    this.setState({loadingOrders: false});
  }

  handleAuthTabChange = tab => {
    this.setState({authTab: tab});
  }

  handleCustomerLogin = async data => {
    this.setState({loggingIn: true});

    const json = await this.request("customer-login/", "POST", data, false);

    if (json.type === "success") {
      localStorage.setItem("jwt-token", json.jwtToken);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", "customer");

      this.setState({loggedIn: true, role: "customer", username: data.username, page: "products"});
      this.fetchProducts();
    }

    this.setState({loggingIn: false});
  }

  handleDispatcherLogin = async data => {
    this.setState({loggingIn: true});

    const json = await this.request("dispatcher-login/", "POST", data, false);

    if (json.type === "success") {
      localStorage.setItem("jwt-token", json.jwtToken);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", "dispatcher");

      this.setState({loggedIn: true, role: "dispatcher", username: data.username});
    }

    this.setState({loggingIn: false});
  }

  handleLogout = () => {
    localStorage.removeItem("jwt-token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    this.setState({
      loggedIn: false,
      role: "",
      username: "",
      page: "products",
      products: [],
      orders: []
    });

    toast.info("Logged out!", options);
  }

  handleNavigate = page => {
    this.setState({page});

    if (page === "orders") {
      this.fetchOrders();
    } else if (page === "products") {
      this.fetchProducts();
    }
  }

  handlePlaceOrder = async data => {
    this.setState({placingOrder: true});

    // Business errors (e.g. out of stock) shouldn't log the customer out
    const json = await this.request("order-place/", "POST", data, false);

    this.setState({placingOrder: false});

    if (json.type === "success") {
      this.fetchProducts();
      return true;
    }

    return false;
  }

  render() {
    const {
      loggedIn, role, username, page, authTab,
      products, orders,
      loggingIn, loadingProducts, loadingOrders, placingOrder
    } = this.state;

    let content;

    if (!loggedIn) {
      content = (
        <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 px-4">
          <div className="inline-flex items-center justify-center rounded-xl border-2 border-amber-200 mb-3 shadow-lg">
            <img src="/logo3.png" alt="En Route" className="w-45 rounded-xl" />
          </div>

          <div className="flex bg-white border border-amber-200 rounded-full p-1 mb-3 shadow-sm">
            {["customer", "dispatcher"].map(tab => (
              <button
                key={tab}
                onClick={() => this.handleAuthTabChange(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors cursor-pointer ${
                  authTab === tab ? "bg-amber-800 text-white" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {authTab === "dispatcher" ? (
            <DispatcherLogin onLogin={this.handleDispatcherLogin} loading={loggingIn} />
          ) : (
            <CustomerLogin onLogin={this.handleCustomerLogin} loading={loggingIn} />
          )}
        </div>
      );
    } else if (role === "dispatcher") {
      content = (
        <DispatcherDashboard request={this.request} username={username} onLogout={this.handleLogout} />
      );
    } else {
      content = (
        <div className="min-h-screen bg-amber-50">
          <Navbar username={username} page={page} onNavigate={this.handleNavigate} onLogout={this.handleLogout} />

          {page === "products" ? (
            <ProductsPage
              products={products}
              loading={loadingProducts}
              placingOrder={placingOrder}
              onPlaceOrder={this.handlePlaceOrder}
            />
          ) : (
            <OrdersPage orders={orders} loading={loadingOrders} />
          )}
        </div>
      );
    }

    // ToastContainer lives here, outside the conditional branches above, so it's
    // never unmounted/remounted when switching between login/dashboard views —
    // otherwise a toast fired right before a state-driven view swap gets dropped.
    return (
      <div className="App">
        {content}
        <ToastContainer />
      </div>
    );
  }
}

export default App;
