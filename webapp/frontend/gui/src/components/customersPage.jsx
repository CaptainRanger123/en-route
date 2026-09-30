import { Component } from "react";

class CustomersPage extends Component {
  render() {
    const { customers, loading } = this.props;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Customers</h1>
          <p className="text-sm text-stone-500 mt-1">Customers registered on En Route.</p>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading customers...</p>
        ) : customers.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">No customers have signed up yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-left text-xs text-stone-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Username</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{customer.name}</td>
                    <td className="px-5 py-3.5 text-stone-600">{customer.username}</td>
                    <td className="px-5 py-3.5 text-stone-600">{customer.phone}</td>
                    <td className="px-5 py-3.5 text-stone-600">{customer.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default CustomersPage;
