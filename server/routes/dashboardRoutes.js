
import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET DASHBOARD SUMMARY
router.get("/summary", protect, async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = summary.find(
      (item) => item._id === "income"
    );

    const expense = summary.find(
      (item) => item._id === "expense"
    );

    const totalIncome = income?.total || 0;
    const totalExpense = expense?.total || 0;

    res.status(200).json({
      message: "Dashboard summary fetched successfully",
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalTransactions:
          (income?.count || 0) + (expense?.count || 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
});

export default router;
