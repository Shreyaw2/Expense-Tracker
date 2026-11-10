
import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import api from "../services/api";

const initialForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get("/transactions");
      const data = response.data;
      setTransactions(
        Array.isArray(data) ? data : data.transactions || []
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split("T")[0],
      notes: transaction.notes || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
      await fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save transaction");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await api.delete(`/transactions/${id}`);
      await fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete transaction");
    }
  };

  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || item.type === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Transactions</h1>
            <p>Manage all your income and expenses.</p>
          </div>

          <button className="primary-button" onClick={openAddForm}>
            <Plus size={18} /> Add Transaction
          </button>
        </header>

        {error && !showForm && (
          <p className="error-message">{error}</p>
        )}

        <section className="dashboard-panel transaction-section">
          <div className="transaction-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="transaction-filter"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          {loading ? (
            <p>Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-transactions">
              <h3>No transactions found</h3>
              <p>Add a transaction or change your search.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.title}</strong>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        {new Date(item.date).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <span className={`transaction-badge ${item.type}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className={item.type === "income" ? "income-text" : "expense-text"}>
                        {item.type === "income" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="edit-action"
                            onClick={() => openEditForm(item)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="delete-action"
                            onClick={() => handleDelete(item._id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>
                <p>Enter your transaction details.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="transaction-type">
                {["expense", "income"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={
                      form.type === type
                        ? `type-button active ${type}`
                        : "type-button"
                    }
                    onClick={() =>
                      setForm({
                        ...form,
                        type,
                        category: type === "income" ? "Salary" : "Food",
                      })
                    }
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {(form.type === "expense"
                    ? ["Food", "Shopping", "Transport", "Bills", "Health", "Education", "Entertainment", "Other"]
                    : ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"]
                  ).map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId ? "Update Transaction" : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
