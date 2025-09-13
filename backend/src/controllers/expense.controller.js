import Expense from "../models/expense.model.js";
import { ObjectId } from "mongodb";

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const userId = req.user._id;

    const newExpense = new Expense({
      userId,
      title,
      amount,
      category,
      date,
    });

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

export const editExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;
    const expense = await Expense.findOne({ _id: new ObjectId(id) });
    if (!expense)
      return res.status(400).json({ message: "Expense doesn't exist" });
    if (expense) {
      expense.title = title;
      expense.amount = amount;
      expense.category = category;
      expense.date = date;
      await expense.save();
      res.status(200).json({ message: "Expense updated successfully" });
    }
  } catch (error) {
    console.log("Error in editExpense controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({ _id: new ObjectId(id) });
    if (!expense)
      return res.status(400).json({ message: "Expense doesn't exist" });
    if (expense) {
      await Expense.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: "Expense deleted successfully" });
    }
  } catch (error) {
    console.log("Error in deleteExpense controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
