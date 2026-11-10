
import express from "express";
import Transaction from "../models/Transaction.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ADD TRANSACTION
router.post("/", protect, async (req, res) => {
  try {
    const { title, amount, type, category, date, notes } = req.body;

    if (
      !title?.trim() ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !type ||
      !category?.trim()
    ) {
      return res.status(400).json({
        message: "Title, amount, type and category are required",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: date || Date.now(),
      notes,
    });

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add transaction",
      error: error.message,
    });
  }
});

// GET ALL TRANSACTIONS OF LOGGED-IN USER
router.get("/", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
    }).sort({ date: -1 });

    res.status(200).json({
      message: "Transactions fetched successfully",
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
});

// UPDATE TRANSACTION
router.put("/:id", protect, async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "amount",
      "type",
      "category",
      "date",
      "notes",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }
      updates.title = updates.title.trim();
    }

    if (updates.amount !== undefined) {
      if (
        updates.amount === "" ||
        !Number.isFinite(Number(updates.amount)) ||
        Number(updates.amount) <= 0
      ) {
        return res.status(400).json({
          message: "Amount must be a positive number",
        });
      }
      updates.amount = Number(updates.amount);
    }

    if (updates.type !== undefined &&
      !["income", "expense"].includes(updates.type)) {
      return res.status(400).json({
        message: "Type must be income or expense",
      });
    }

    if (updates.category !== undefined) {
      if (
        typeof updates.category !== "string" ||
        !updates.category.trim()
      ) {
        return res.status(400).json({
          message: "Category cannot be empty",
        });
      }
      updates.category = updates.category.trim();
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update transaction",
      error: error.message,
    });
  }
});

// DELETE TRANSACTION
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
});

export default router;
