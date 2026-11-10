
import { useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";

function TransactionForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await api.post("/transactions", {
        ...formData,
        amount: Number(formData.amount),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to add transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="transaction-modal">
        <div className="modal-header">
          <div>
            <h2>Add Transaction</h2>
            <p>Record your income or expenses.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="transaction-type">
            <button
              type="button"
              className={
                formData.type === "expense"
                  ? "type-button active expense"
                  : "type-button"
              }
              onClick={() =>
                setFormData({
                  ...formData,
                  type: "expense",
                  category: "Food",
                })
              }
            >
              Expense
            </button>

            <button
              type="button"
              className={
                formData.type === "income"
                  ? "type-button active income"
                  : "type-button"
              }
              onClick={() =>
                setFormData({
                  ...formData,
                  type: "income",
                  category: "Salary",
                })
              }
            >
              Income
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label>Transaction Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Grocery shopping"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {(
                formData.type === "expense"
                  ? [
                      "Food",
                      "Shopping",
                      "Transport",
                      "Bills",
                      "Health",
                      "Education",
                      "Entertainment",
                      "Other",
                    ]
                  : [
                      "Salary",
                      "Freelance",
                      "Business",
                      "Investment",
                      "Gift",
                      "Other",
                    ]
              ).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              placeholder="Add some details..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
