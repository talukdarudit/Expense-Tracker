import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import path from "path";

import { connectDB } from "./lib/db.js";

import expenseRoutes from "./routes/expense.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
