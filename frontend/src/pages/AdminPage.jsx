import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import {
  Edit3,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter,
  X,
  History,
  User,
  Calendar,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const AdminPage = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingExpenseId, setUpdatingExpenseId] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Chart color palette
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
  ];

  // Get unique categories and statuses from data
  const getFilterOptions = () => {
    const categories = [
      ...new Set(
        expenseData.map((expense) => expense.category || "Uncategorized")
      ),
    ];
    const statuses = [
      ...new Set(expenseData.map((expense) => expense.status || "pending")),
    ];
    return { categories, statuses };
  };

  // Filter the expense data based on current filters
  const filteredExpenseData = expenseData.filter((expense) => {
    const statusMatch =
      filters.status === "all" ||
      (expense.status || "pending") === filters.status;
    const categoryMatch =
      filters.category === "all" ||
      (expense.category || "Uncategorized") === filters.category;
    return statusMatch && categoryMatch;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilters({ status: "all", category: "all" });
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.status !== "all" || filters.category !== "all";

  // Process data for charts (using filtered data)
  const getChartData = () => {
    // Category-wise expenses
    const categoryData = filteredExpenseData.reduce((acc, expense) => {
      const category = expense.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    const categoryChartData = Object.entries(categoryData).map(
      ([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      })
    );

    // Status-wise expenses
    const statusData = filteredExpenseData.reduce((acc, expense) => {
      const status = expense.status || "pending";
      acc[status] = (acc[status] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    const statusChartData = Object.entries(statusData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(value.toFixed(2)),
      count: filteredExpenseData.filter((e) => (e.status || "pending") === name)
        .length,
    }));

    // Monthly trend (last 6 months)
    const monthlyData = filteredExpenseData.reduce((acc, expense) => {
      const date = new Date(expense.date || expense.createdAt);
      const monthKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      acc[monthKey] = (acc[monthKey] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    const monthlyChartData = Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-6)
      .map(([month, amount]) => ({
        month,
        amount: parseFloat(amount.toFixed(2)),
      }));

    return { categoryChartData, statusChartData, monthlyChartData };
  };

  const { categoryChartData, statusChartData, monthlyChartData } =
    getChartData();
  const { categories, statuses } = getFilterOptions();

  // Get all audit log entries across all expenses
  const getAllAuditEntries = () => {
    const allEntries = [];

    expenseData.forEach((expense) => {
      if (expense.auditLog && Array.isArray(expense.auditLog)) {
        expense.auditLog.forEach((entry) => {
          allEntries.push({
            ...entry,
            expenseId: expense._id,
            expenseAmount: expense.amount,
            expenseCategory: expense.category,
          });
        });
      }
    });

    // Sort by timestamp (newest first)
    return allEntries.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/expense/getallexpenses");
      setExpenseData(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      setError("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (expenseId, currentStatus) => {
    // Determine next status in cycle: pending -> approved -> rejected -> pending
    let newStatus;
    switch (currentStatus) {
      case "pending":
        newStatus = "approved";
        break;
      case "approved":
        newStatus = "rejected";
        break;
      case "rejected":
        newStatus = "pending";
        break;
      default:
        newStatus = "approved";
    }

    try {
      setUpdatingExpenseId(expenseId);

      // Make API call to update status
      await axiosInstance.put("/expense/updatestatus", {
        expenseId,
        status: newStatus,
      });

      // Update local state to reflect the change
      setExpenseData((prevData) =>
        prevData.map((expense) =>
          expense._id === expenseId || expense.id === expenseId
            ? { ...expense, status: newStatus }
            : expense
        )
      );

      toast.success(`Status changed to ${newStatus}`);

      // Refresh data to get updated audit log
      fetchExpenses();
    } catch (error) {
      console.error("Error updating status:", error.message);
      toast.error("Failed to update status");
    } finally {
      setUpdatingExpenseId(null);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "created":
        return <User className="size-4 text-blue-500" />;
      case "status_updated":
        return <Edit3 className="size-4 text-orange-500" />;
      default:
        return <Activity className="size-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "created":
        return "badge-info";
      case "status_updated":
        return "badge-warning";
      default:
        return "badge-neutral";
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto p-6">
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="btn btn-sm btn-outline" onClick={fetchExpenses}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-base-content/70">
              Manage all expenses across the organization
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-outline gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="size-4" />
              Filters
              {hasActiveFilters && (
                <div className="badge badge-primary badge-xs"></div>
              )}
            </button>
            <button
              className="btn btn-secondary gap-2"
              onClick={() => setShowAuditLog(!showAuditLog)}
            >
              <History className="size-5" />
              {showAuditLog ? "Hide Audit Log" : "Show Audit Log"}
            </button>
            <button
              className="btn btn-primary gap-2"
              onClick={() => setShowCharts(!showCharts)}
            >
              <BarChart3 className="size-5" />
              {showCharts ? "Hide Charts" : "Show Charts"}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="card-title">Filter Expenses</h3>
                {hasActiveFilters && (
                  <button
                    className="btn btn-sm btn-ghost gap-1"
                    onClick={clearFilters}
                  >
                    <X className="size-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Filter by Status
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="all">All Statuses</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Filter by Category
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4">
                  <div className="text-sm text-base-content/70 mb-2">
                    Active Filters:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.status !== "all" && (
                      <div className="badge badge-primary gap-2">
                        Status:{" "}
                        {filters.status.charAt(0).toUpperCase() +
                          filters.status.slice(1)}
                        <button
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: "all" }))
                          }
                          className="text-xs hover:text-error"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    )}
                    {filters.category !== "all" && (
                      <div className="badge badge-secondary gap-2">
                        Category: {filters.category}
                        <button
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, category: "all" }))
                          }
                          className="text-xs hover:text-error"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Log Section */}
        {showAuditLog && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <History className="size-5 text-secondary" />
                <h3 className="card-title">Audit Log</h3>
                <div className="badge badge-neutral">
                  {getAllAuditEntries().length} entries
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Expense ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAllAuditEntries()
                      .slice(0, 50)
                      .map((entry, index) => (
                        <tr key={`${entry.expenseId}-${index}`}>
                          <td className="text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4 text-gray-500" />
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {getActionIcon(entry.action)}
                              <div
                                className={`badge ${getActionColor(
                                  entry.action
                                )}`}
                              >
                                {entry.action.replace("_", " ")}
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-sm">
                            {entry.expenseId
                              ? entry.expenseId.slice(-6)
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {getAllAuditEntries().length > 50 && (
                  <div className="text-center py-4 text-sm text-base-content/70">
                    Showing last 50 audit logs of {getAllAuditEntries().length}{" "}
                    total
                  </div>
                )}

                {getAllAuditEntries().length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-base-content/70">
                      No audit entries found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="stats shadow mb-6">
          <div className="stat">
            <div className="stat-title">
              {hasActiveFilters ? "Filtered" : "Total"} Expenses
            </div>
            <div className="stat-value">{filteredExpenseData.length}</div>
            {hasActiveFilters && (
              <div className="stat-desc">of {expenseData.length} total</div>
            )}
          </div>
          <div className="stat">
            <div className="stat-title">
              {hasActiveFilters ? "Filtered" : "Total"} Amount
            </div>
            <div className="stat-value">
              $
              {filteredExpenseData
                .reduce((total, expense) => total + (expense.amount || 0), 0)
                .toFixed(2)}
            </div>
            {hasActiveFilters && (
              <div className="stat-desc">
                of $
                {expenseData
                  .reduce((total, expense) => total + (expense.amount || 0), 0)
                  .toFixed(2)}{" "}
                total
              </div>
            )}
          </div>
          <div className="stat">
            <div className="stat-title">Pending</div>
            <div className="stat-value text-warning">
              {
                filteredExpenseData.filter(
                  (e) => (e.status || "pending") === "pending"
                ).length
              }
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Approved</div>
            <div className="stat-value text-success">
              {
                filteredExpenseData.filter((e) => e.status === "approved")
                  .length
              }
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {showCharts && expenseData.length > 0 && (
          <div className="mb-8 space-y-6">
            {/* Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="size-5 text-primary" />
                    <h3 className="card-title">Expenses by Category</h3>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}`, "Amount"]}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="size-5 text-secondary" />
                    <h3 className="card-title">Status Distribution</h3>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "value" ? `${value}` : value,
                            name === "value" ? "Amount" : "Count",
                          ]}
                        />
                        <Bar dataKey="value" fill="#8884d8" />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="size-5 text-accent" />
                  <h3 className="card-title">Monthly Expense Trend</h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}`, "Amount"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                        name="Monthly Expenses"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">Quick Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Top Category</div>
                    <div className="stat-value text-lg">
                      {categoryChartData.length > 0
                        ? categoryChartData.reduce((max, cat) =>
                            cat.value > max.value ? cat : max
                          ).name
                        : "N/A"}
                    </div>
                    <div className="stat-desc">
                      $
                      {categoryChartData.length > 0
                        ? categoryChartData.reduce((max, cat) =>
                            cat.value > max.value ? cat : max
                          ).value
                        : "0.00"}
                    </div>
                  </div>

                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Average Expense</div>
                    <div className="stat-value text-lg">
                      $
                      {expenseData.length > 0
                        ? (
                            expenseData.reduce(
                              (sum, exp) => sum + (exp.amount || 0),
                              0
                            ) / expenseData.length
                          ).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>

                  <div className="stat bg-base-200 rounded-lg">
                    <div className="stat-title">Approval Rate</div>
                    <div className="stat-value text-lg">
                      {expenseData.length > 0
                        ? (
                            (expenseData.filter((e) => e.status === "approved")
                              .length /
                              expenseData.length) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {expenseData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Expenses Found</h3>
            <p className="text-base-content/70">
              There are no expenses to display at the moment.
            </p>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-header p-6 border-b">
              <h2 className="card-title text-xl">All Expenses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenseData.map((expense) => {
                    const expenseId = expense._id;
                    const isUpdating = updatingExpenseId === expenseId;

                    return (
                      <tr key={expenseId}>
                        <td className="font-mono text-sm">
                          {expense._id ? expense._id.slice(-6) : "N/A"}
                        </td>
                        <td className="font-mono text-sm">
                          {expense.userId ? expense.userId.slice(-6) : "N/A"}
                        </td>
                        <td>
                          <div className="font-mono text-sm">
                            {expense.category || "Uncategorized"}
                          </div>
                        </td>
                        <td className="font-semibold">
                          ${expense.amount ? expense.amount.toFixed(2) : "0.00"}
                        </td>
                        <td>
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString()
                            : expense.createdAt
                            ? new Date(expense.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <div
                            className={`badge ${
                              expense.status === "approved"
                                ? "badge-success"
                                : expense.status === "rejected"
                                ? "badge-error"
                                : "badge-warning"
                            }`}
                          >
                            {expense.status || "pending"}
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-ghost gap-1"
                            onClick={() =>
                              changeStatus(
                                expenseId,
                                expense.status || "pending"
                              )
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <div className="loading loading-spinner loading-xs"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <Edit3 className="size-4" />
                                Change Status
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
