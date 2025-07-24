import React, { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { Plus, X, DollarSign, FileText, Calendar, Tag } from "lucide-react";
import toast from "react-hot-toast";

const EmployeePage = () => {
  const { authUser } = useAuthStore();
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: "",
  });

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Office Supplies",
    "Travel",
    "Entertainment",
    "Healthcare",
    "Utilities",
    "Training",
    "Other",
  ];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/expense/getexpenses");
      setExpenseData(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      setError("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (!formData.date) {
      toast.error("Date is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post("/expense/addexpense", {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      toast.success("Expense added successfully!");
      setFormData({ amount: "", category: "", date: "" });
      setShowAddForm(false);
      fetchExpenses(); // Refresh the expense list
    } catch (error) {
      console.error("Error adding expense:", error.message);
      toast.error("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ amount: "", category: "", date: "" });
    setShowAddForm(false);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome {authUser?.fullName}
            </h1>
            <p className="text-base-content/70">Manage all your expenses.</p>
          </div>
          <button
            className="btn btn-primary gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="size-5" />
            Add Expense
          </button>
        </div>

        <div className="stats shadow mb-6">
          <div className="stat">
            <div className="stat-title">Your Expenses</div>
            <div className="stat-value">{expenseData.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Amount</div>
            <div className="stat-value">
              $
              {expenseData
                .reduce((total, expense) => total + (expense.amount || 0), 0)
                .toFixed(2)}
            </div>
          </div>
        </div>

        {/* Add Expense Modal */}
        {showAddForm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Add New Expense</h3>
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={resetForm}
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                {/* Amount */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Amount</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input input-bordered w-full pl-10"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="size-5 text-base-content/40" />
                    </div>
                    <select
                      className="select select-bordered w-full pl-10"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="">Select Category</option>
                      {expenseCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Date</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="size-5 text-base-content/40" />
                    </div>
                    <input
                      type="date"
                      className="input input-bordered w-full pl-10"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading loading-spinner loading-sm"></div>
                        Adding...
                      </>
                    ) : (
                      "Add Expense"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {expenseData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Expenses Found</h3>
            <p className="text-base-content/70 mb-4">
              There are no expenses to display at the moment.
            </p>
            <button
              className="btn btn-primary gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="size-5" />
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-header p-6 border-b">
              <h2 className="card-title text-xl">Your Expenses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.map((expense) => (
                    <tr key={expense._id || expense.id}>
                      <td className="font-mono text-sm">
                        {expense._id ? expense._id.slice(-6) : "N/A"}
                      </td>
                      <td>
                        <div className="badge badge-outline">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;
