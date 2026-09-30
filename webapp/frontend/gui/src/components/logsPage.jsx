import { Component } from "react";

const LEVEL_STYLES = {
  INFO: "bg-blue-50 text-blue-700",
  WARNING: "bg-amber-100 text-amber-800",
  ERROR: "bg-red-50 text-red-700",
};

class LogsPage extends Component {
  render() {
    const { logs, loading } = this.props;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-stone-900">Logs</h1>
          <p className="text-sm text-stone-500 mt-1">Audit trail of system activity, most recent first.</p>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500">Loading logs...</p>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-500">No audit logs yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm divide-y divide-amber-100">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-stone-900">{log.text}</p>
                  <p className="text-xs text-stone-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                  LEVEL_STYLES[log.level?.toUpperCase()] || "bg-stone-100 text-stone-600"
                }`}>
                  {log.level}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default LogsPage;
