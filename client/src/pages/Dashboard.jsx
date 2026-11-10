
import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Sidebar from "../components/dashboard/Sidebar";
import TransactionForm from "../components/dashboard/TransactionForm";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react";

import api from "../services/api";

const COLORS = [
  "#4f46e5",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
  "#ec4899",
];

function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalTransactions: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const [summaryResponse, transactionResponse] =
        await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/transactions"),
        ]);

      setSummary(summaryResponse.data.summary);

      const data = transactionResponse.data;

      setTransactions(
        Array.isArray(data)
          ? data
          : data.transactions || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(2026, index, 1).toLocaleString(
      "en-IN",
      { month: "short" }
    );

    const monthTransactions = transactions.filter((item) => {
      const date = new Date(item.date);

      return (
        date.getFullYear() === 2026 &&
        date.getMonth() === index
      );
    });

    return {
      month,
      income: monthTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0),

      expense: monthTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount), 0),
    };
  });

  const categoryMap = {};

  transactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      categoryMap[item.category] =
        (categoryMap[item.category] || 0) +
        Number(item.amount);
    });

  const categoryData = Object.entries(categoryMap).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Here's what's happening with your money.</p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-date">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            <button
              className="primary-button add-transaction-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </header>

        {loading ? (
          <p>Loading dashboard data...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <section className="summary-grid">
              <div className="summary-card">
                <div className="summary-card-top">
                  <span>Total Balance</span>
                  <div className="summary-icon purple">
                    <Wallet size={21} />
                  </div>
                </div>
                <h2>{formatCurrency(summary.balance)}</h2>
                <p>Your available balance</p>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <span>Total Income</span>
                  <div className="summary-icon green">
                    <TrendingUp size={21} />
                  </div>
                </div>
                <h2>{formatCurrency(summary.totalIncome)}</h2>
                <p>Your total earnings</p>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <span>Total Expenses</span>
                  <div className="summary-icon red">
                    <TrendingDown size={21} />
                  </div>
                </div>
                <h2>{formatCurrency(summary.totalExpense)}</h2>
                <p>Your total spending</p>
              </div>
            </section>

            <section className="charts-grid">
              <div className="dashboard-panel chart-panel">
                <h3>Income vs Expenses</h3>
                <p className="chart-description">
                  Monthly financial overview for 2026
                </p>

                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />

                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#16a34a"
                      radius={[5, 5, 0, 0]}
                    />

                    <Bar
                      dataKey="expense"
                      name="Expenses"
                      fill="#ef4444"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="dashboard-panel chart-panel">
                <h3>Expense Categories</h3>
                <p className="chart-description">
                  Spending distribution by category
                </p>

                {categoryData.length === 0 ? (
                  <div className="empty-chart">
                    No expense data available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="dashboard-panel recent-panel">
              <h3>Recent Transactions</h3>
              <p>
                Total transactions: {summary.totalTransactions}
              </p>
            </section>
          </>
        )}
      </main>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={fetchDashboard}
        />
      )}
    </div>
  );
}

export default Dashboard;
