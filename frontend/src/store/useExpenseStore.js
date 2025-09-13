import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  selectedExpense: null,
  isExpensesLoading: false,
  isSubmitting: false,

  fetchExpenses: async () => {
    set({ isExpensesLoading: true });
    try {
      const res = await axiosInstance.get("/expenses/get");
      set({ expenses: res.data });
    } catch (error) {
      console.log("Error in fetchExpenses:", error);
    } finally {
      set({ isExpensesLoading: false });
    }
  },

  addExpense: async (expenseData) => {
    set({ isSubmitting: true });
    try {
      const res = await axiosInstance.post("/expenses/add", expenseData);
      set((state) => ({
        expenses: [...state.expenses, res.data],
      }));
      toast.success("Expense added successfully");
    } catch (error) {
      console.log("Error in addExpense:", error);
    } finally {
      set({ isSubmitting: false });
    }
  },

  editExpense: async (id, expenseData) => {
    set({ isSubmitting: true });
    try {
      await axiosInstance.put(`/expenses/${id}/edit`, expenseData);
      set((state) => ({
        expenses: [...state.expenses, res.data],
      }));
      toast.success("Expense updated successfully");
    } catch (error) {
      console.log("Error in editExpense:", error);
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteExpense: async (id) => {
    try {
      await axiosInstance.delete(`/expenses/${id}/delete`);
      set((state) => ({
        expenses: [...state.expenses, res.data],
      }));
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.log("Error in deleteExpense:", error);
    }
  },
}));
