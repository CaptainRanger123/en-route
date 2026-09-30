import { Component } from "react";

import Sidebar from "./sidebar.jsx";
import ManageProductsPage from "./manageProductsPage.jsx";
import WarehousesPage from "./warehousesPage.jsx";
import RidersPage from "./ridersPage.jsx";
import DispatcherOrdersPage from "./dispatcherOrdersPage.jsx";
import CustomersPage from "./customersPage.jsx";
import LogsPage from "./logsPage.jsx";
import MapPage from "./mapPage.jsx";
import OrderDetailModal from "./orderDetailModal.jsx";

class DispatcherDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: "products",

      products: [],
      warehouses: [],
      riders: [],
      orders: [],
      customers: [],
      logs: [],

      loadingProducts: false,
      loadingWarehouses: false,
      loadingRiders: false,
      loadingOrders: false,
      loadingCustomers: false,
      loadingLogs: false,

      savingProduct: false,
      savingWarehouse: false,
      savingRider: false,

      selectedOrderId: null,
      orderDetail: null,
      loadingOrderDetail: false,
      deletingOrder: false,
    };
  }

  componentDidMount() {
    this.fetchProducts();
    this.fetchWarehouses();
  }

  fetchProducts = async () => {
    this.setState({ loadingProducts: true });
    const json = await this.props.request("product-list/", "GET", null, true, false);
    if (json.type === "success") {
      this.setState({ products: json.data });
    }
    this.setState({ loadingProducts: false });
  };

  fetchWarehouses = async () => {
    this.setState({ loadingWarehouses: true });
    const json = await this.props.request("warehouse-list/", "GET", null, true, false);
    if (json.type === "success") {
      this.setState({ warehouses: json.data });
    }
    this.setState({ loadingWarehouses: false });
  };

  fetchRiders = async () => {
    this.setState({ loadingRiders: true });
    const json = await this.props.request("rider-list/", "GET", null, true, false);
    if (json.type === "success") {
      this.setState({ riders: json.data });
    }
    this.setState({ loadingRiders: false });
  };

  fetchOrders = async () => {
    this.setState({ loadingOrders: true });
    const json = await this.props.request("order-list/", "GET", null, true, false);
    if (json.type === "success") {
      this.setState({ orders: json.data });
    }
    this.setState({ loadingOrders: false });
  };

  fetchCustomers = async () => {
    this.setState({ loadingCustomers: true });
    const json = await this.props.request("customer-list/", "GET", null, true, false);
    if (json.type === "success") {
      this.setState({ customers: json.data });
    }
    this.setState({ loadingCustomers: false });
  };

  fetchLogs = async () => {
    this.setState({ loadingLogs: true });
    const json = await this.props.request("audit-logs/", "GET", null, true, false);
    if (json.type === "success") {
      this.setState({ logs: json.data });
    }
    this.setState({ loadingLogs: false });
  };

  handleNavigate = navPage => {
    this.setState({ page: navPage });

    if (navPage === "products") this.fetchProducts();
    else if (navPage === "warehouses") this.fetchWarehouses();
    else if (navPage === "riders") this.fetchRiders();
    else if (navPage === "orders") this.fetchOrders();
    else if (navPage === "customers") this.fetchCustomers();
    else if (navPage === "logs") this.fetchLogs();
  };

  handleAddProduct = async data => {
    this.setState({ savingProduct: true });
    const json = await this.props.request("product-add/", "POST", data);
    this.setState({ savingProduct: false });

    if (json.type === "success") {
      this.fetchProducts();
      return true;
    }
    return false;
  }

  handleUpdateProduct = async (productId, data) => {
    this.setState({ savingProduct: true });
    const json = await this.props.request(`product-update/${productId}/`, "POST", data);
    this.setState({ savingProduct: false });

    if (json.type === "success") {
      this.fetchProducts();
      return true;
    }
    return false;
  }

  handleDeleteProduct = async productId => {
    const json = await this.props.request(`product-delete/${productId}/`, "DELETE");

    if (json.type === "success") {
      this.fetchProducts();
    }
  }

  handleAddWarehouse = async data => {
    this.setState({ savingWarehouse: true });
    const json = await this.props.request("warehouse-add/", "POST", data);
    this.setState({ savingWarehouse: false });

    if (json.type === "success") {
      this.fetchWarehouses();
      return true;
    }
    return false;
  }

  handleUpdateWarehouse = async (warehouseId, data) => {
    this.setState({ savingWarehouse: true });
    const json = await this.props.request(`warehouse-update/${warehouseId}/`, "PUT", data);
    this.setState({ savingWarehouse: false });

    if (json.type === "success") {
      this.fetchWarehouses();
      return true;
    }
    return false;
  }

  handleDeleteWarehouse = async warehouseId => {
    const json = await this.props.request(`warehouse-delete/${warehouseId}/`, "DELETE");

    if (json.type === "success") {
      this.fetchWarehouses();
    }
  }

  handleAddRider = async data => {
    this.setState({ savingRider: true });
    const json = await this.props.request("rider-add/", "POST", data);
    this.setState({ savingRider: false });

    if (json.type === "success") {
      this.fetchRiders();
      return true;
    }
    return false;
  }

  handleUpdateRider = async (riderId, data) => {
    this.setState({ savingRider: true });
    const json = await this.props.request(`rider-update/${riderId}/`, "PUT", data);
    this.setState({ savingRider: false });

    if (json.type === "success") {
      this.fetchRiders();
      return true;
    }
    return false;
  }

  handleDeleteRider = async riderId => {
    const json = await this.props.request(`rider-delete/${riderId}/`, "DELETE");

    if (json.type === "success") {
      this.fetchRiders();
    }
  }

  handleViewOrder = async orderId => {
    this.setState({ selectedOrderId: orderId, orderDetail: null, loadingOrderDetail: true });

    const json = await this.props.request(`order-detail/${orderId}/`, "GET", null, true, false);

    if (json.type === "success") {
      this.setState({ orderDetail: json.data });
    }

    this.setState({ loadingOrderDetail: false });
  }

  handleCloseOrderDetail = () => {
    this.setState({ selectedOrderId: null, orderDetail: null });
  }

  handleDeleteOrder = async orderId => {
    this.setState({ deletingOrder: true });
    const json = await this.props.request(`order-delete/${orderId}/`, "DELETE");
    this.setState({ deletingOrder: false });

    if (json.type === "success") {
      this.handleCloseOrderDetail();
      this.fetchOrders();
    }
  }

  render() {
    const { username, onLogout } = this.props;
    const {
      page, products, warehouses, riders, orders, customers, logs,
      loadingProducts, loadingWarehouses, loadingRiders, loadingOrders,
      loadingCustomers, loadingLogs, savingProduct, savingWarehouse, savingRider,
      selectedOrderId, orderDetail, loadingOrderDetail, deletingOrder,
    } = this.state;

    return (
      <div className="min-h-screen flex bg-amber-50">
        <Sidebar page={page} onNavigate={this.handleNavigate} username={username} onLogout={onLogout} />

        <main className="flex-1">
          {page === "products" && (
            <ManageProductsPage
              products={products}
              warehouses={warehouses}
              loading={loadingProducts}
              saving={savingProduct}
              onAddProduct={this.handleAddProduct}
              onUpdateProduct={this.handleUpdateProduct}
              onDeleteProduct={this.handleDeleteProduct}
            />
          )}

          {page === "warehouses" && (
            <WarehousesPage
              warehouses={warehouses}
              loading={loadingWarehouses}
              saving={savingWarehouse}
              onAddWarehouse={this.handleAddWarehouse}
              onUpdateWarehouse={this.handleUpdateWarehouse}
              onDeleteWarehouse={this.handleDeleteWarehouse}
            />
          )}

          {page === "riders" && (
            <RidersPage
              riders={riders}
              warehouses={warehouses}
              loading={loadingRiders}
              saving={savingRider}
              onAddRider={this.handleAddRider}
              onUpdateRider={this.handleUpdateRider}
              onDeleteRider={this.handleDeleteRider}
            />
          )}

          {page === "map" && (
            <MapPage request={this.props.request} />
          )}

          {page === "orders" && (
            <DispatcherOrdersPage
              orders={orders}
              loading={loadingOrders}
              onViewOrder={this.handleViewOrder}
            />
          )}

          {page === "customers" && (
            <CustomersPage customers={customers} loading={loadingCustomers} />
          )}

          {page === "logs" && (
            <LogsPage logs={logs} loading={loadingLogs} />
          )}
        </main>

        {selectedOrderId && (
          <OrderDetailModal
            order={orderDetail || { id: selectedOrderId }}
            loading={loadingOrderDetail}
            deleting={deletingOrder}
            onClose={this.handleCloseOrderDetail}
            onDelete={this.handleDeleteOrder}
          />
        )}
      </div>
    );
  }
}

export default DispatcherDashboard;
