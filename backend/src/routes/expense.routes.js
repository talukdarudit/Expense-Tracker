import express from "express";

import {
  getExpenses,
  addExpense,
  editExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get", protectRoute, getExpenses);

router.post("/add", protectRoute, addExpense);

router.put("/:id/edit", protectRoute, editExpense);

router.delete("/:id/delete", protectRoute, deleteExpense);

export default router;
