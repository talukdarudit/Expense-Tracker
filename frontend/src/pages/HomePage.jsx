import React, { useState, useEffect } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useExpenseStore } from "../store/useExpenseStore";

const HomePage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: 0,
    category: "",
    date: "",
  });

  const {
    fetchExpenses,
    expenses,
    isExpensesLoading,
    addExpense,
    editExpense,
    deleteExpense,
    isSubmitting,
  } = useExpenseStore();

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

  // Form validation
  const validateForm = () => {
    if (!formData.title) return toast.error("Title is required");
    if (!formData.amount || formData.amount <= 0)
      return toast.error("Valid amount is required");
    if (!formData.category) return toast.error("Category is required");
    if (!formData.date) return toast.error("Date is required");

    return true;
  };

  const resetForm = () => {
    setFormData({ title: "", amount: "", category: "", date: "" });
    setShowAddForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleAddOrEditExpense = async (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      if (isEditing && editingId) {
        await editExpense(editingId, formData);
        toast.success("Expense updated successfully");
      } else {
        await addExpense(formData);
        toast.success("Expense added successfully");
      }
      resetForm();
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date || expense.createdAt || "",
    });
    setIsEditing(true);
    setEditingId(expense._id || expense.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmDelete) return;

    await deleteExpense(id);
    toast.success("Expense deleted successfully");
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  if (isExpensesLoading) {
    return (
      <div className="pt-20 flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
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
            <div className="stat-value">{expenses.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Amount</div>
            <div className="stat-value">
              $
              {expenses
                .reduce(
                  (total, expense) => total + Number(expense.amount || 0),
                  0
                )
                .toFixed(2)}
            </div>
          </div>
        </div>

        {/* Add/Edit Expense Modal */}
        {showAddForm && (
          <div className="modal modal-open">
            <div className="modal-box">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">
                  {isEditing ? "Edit Expense" : "Add New Expense"}
                </h3>
                <button
                  className="btn btn-sm btn-circle btn-ghost"
                  onClick={resetForm}
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddOrEditExpense} className="space-y-4">
                {/* Title */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                {/* Amount */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Amount</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="input input-bordered w-full"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>

                {/* Category */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
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

                {/* Date */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
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
                        {isEditing ? "Updating..." : "Adding..."}
                      </>
                    ) : isEditing ? (
                      "Update Expense"
                    ) : (
                      "Add Expense"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expense Table */}
        {expenses.length === 0 ? (
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
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id || expense.id}>
                      <td>{expense.title}</td>
                      <td className="font-semibold">${expense.amount}</td>
                      <td>
                        <div className="badge badge-outline">
                          {expense.category}
                        </div>
                      </td>
                      <td>
                        {expense.date
                          ? new Date(expense.date).toLocaleDateString()
                          : expense.createdAt
                          ? new Date(expense.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-sm btn-ghost text-blue-600"
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-red-600"
                          onClick={() =>
                            handleDelete(expense._id || expense.id)
                          }
                        >
                          <Trash2 className="size-4" />
                        </button>
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

export default HomePage;
