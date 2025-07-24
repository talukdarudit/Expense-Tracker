import express from "express";
import {
  protectRoute,
  protectAdminRoute,
} from "../middleware/auth.middleware.js";
import {
  getExpenses,
  getAllExpenses,
  addExpense,
  updateStatus,
} from "../controllers/expense.controller.js";

const router = express.Router();

router.get("/getexpenses", protectRoute, getExpenses);

router.post("/addexpense", protectRoute, addExpense);

router.get("/getallexpenses", protectAdminRoute, getAllExpenses);

router.put("/updatestatus", protectAdminRoute, updateStatus);

export default router;
