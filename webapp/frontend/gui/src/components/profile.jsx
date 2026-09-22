import { Component } from "react";

import Button from "./button.jsx";

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fullName: "",
      address: "",
      phone: "",
      email: "",
      loading: true,
      saving: false,
    }
  }

  componentDidMount() {
    this.fetchProfile();
  }

  fetchProfile = async () => {
    const json = await this.props.request("current-user/", "GET", null, true, false);

    if (json.type === "success") {
      this.setState({
        fullName: json.full_name || "",
        address: json.address || "",
        phone: json.phone || "",
        email: json.email || "",
        loading: false,
      });
    } else {
      this.setState({ loading: false });
    }
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ saving: true });

    await this.props.request("profile/update/", "POST", {
      full_name: this.state.fullName,
      address: this.state.address,
      phone: this.state.phone,
      email: this.state.email,
    });

    this.setState({ saving: false });
  }

  render() {
    const { accType, username } = this.props;
    const { fullName, address, phone, email, loading, saving } = this.state;

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Profile</h2>
          <p className="text-xs text-gray-400 mt-1">
            These details appear as your legal identity on generated contract documents.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading profile...</div>
        ) : (
          <form className="p-6 flex flex-col gap-4" onSubmit={this.handleSubmit} id="profile-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500">Username</label>
                <input
                  disabled value={username || ""}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500">Account Type</label>
                <input
                  disabled value={accType || ""}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="fullName">Full Name</label>
              <input
                type="text" name="fullName" id="fullName" placeholder="Enter your full legal name"
                value={fullName} onChange={this.handleChange}
                className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="address">Address</label>
              <input
                type="text" name="address" id="address" placeholder="Enter your address"
                value={address} onChange={this.handleChange}
                className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="phone">Phone</label>
                <input
                  type="tel" name="phone" id="phone" placeholder="Enter your phone number"
                  value={phone} onChange={this.handleChange}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide text-gray-500" htmlFor="email">Email</label>
                <input
                  type="email" name="email" id="email" placeholder="Enter your email"
                  value={email} onChange={this.handleChange}
                  className="mt-1 w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                formSubmit="profile-form"
                text={saving ? "Saving..." : "Save Profile"}
                color="default"
              />
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default Profile;
