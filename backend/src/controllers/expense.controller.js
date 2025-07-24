import Expense from "../models/expense.model.js";
import { ObjectId } from "mongodb";

export const addExpense = async (req, res) => {
  try {
    const { category, amount, date } = req.body;
    const userId = req.user._id;

    const newExpense = new Expense({
      userId,
      category,
      amount,
      date,
    });

    await newExpense.save();
    if (newExpense) {
      newExpense.auditLog.push({
        action: "Expense created",
        timestamp: new Date(),
      });
    }
    await newExpense.save();

    res.status(201).json(newExpense);
  } catch (error) {
    console.log("Error in addExpense controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const myId = req.user._id;

    const expenses = await Expense.find({ userId: myId });

    res.status(200).json(expenses);
  } catch (error) {
    console.log("Error in getExpenses controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({});

    res.status(200).json(expenses);
  } catch (error) {
    console.log("Error in getExpenses controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { expenseId, status } = req.body;
    const expense = await Expense.findOne({ _id: new ObjectId(expenseId) });
    if (!expense)
      return res.status(400).json({ message: "Expense doesn't exist" });

    if (expense) {
      expense.status = status;
      expense.auditLog.push({
        action: `Expense status updated to ${status}`,
        timestamp: new Date(),
      });
      await expense.save();

      res.status(200).json({
        _id: expense._id,
        status: expense.status,
      });
    }
  } catch (error) {
    console.log("Error in updateStatus controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
