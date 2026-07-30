import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReceiptUpload from '../components/ReceiptUpload';
import ManualExpenseForm from '../components/ManualExpenseForm';
import ExpenseList from '../components/ExpenseList';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const [tab, setTab] = useState('scan'); // 'scan' | 'manual'
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState(user.monthlyBudget || '');
  const currentMonth = new Date().toISOString().slice(0, 7);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [expRes, summaryRes, trendRes] = await Promise.all([
      api.get(`/expenses?month=${currentMonth}`),
      api.get(`/analytics/summary?month=${currentMonth}`),
      api.get('/analytics/trend'),
    ]);
    setExpenses(expRes.data.expenses);
    setSummary(summaryRes.data);
    setTrend(trendRes.data.trend);
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleExpenseSaved = () => loadAll();
  const handleExpenseDeleted = () => loadAll();

  const handleBudgetSave = async () => {
    const { data } = await api.put('/auth/budget', { monthlyBudget: parseFloat(budgetInput) || 0 });
    updateUser(data.user);
    loadAll();
  };

  if (loading || !summary) return <div className="loading-screen">Loading your dashboard...</div>;

  return (
    <div className="app-shell">
      <div className="navbar">
        <h1>💸 SnapSpend</h1>
        <div className="user-info">
          <span>{user.name}</span>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="stat-row">
          <div className="stat-box">
            <div className="label">Spent this month</div>
            <div className="value">৳{summary.totalSpent}</div>
          </div>
          <div className="stat-box">
            <div className="label">Transactions</div>
            <div className="value">{summary.transactionCount}</div>
          </div>
          <div className="stat-box">
            <div className="label">Remaining budget</div>
            <div className={`value ${summary.remaining < 0 ? 'over-budget' : 'under-budget'}`}>
              ৳{summary.remaining}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Monthly Budget</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Set your monthly budget"
              style={{
                flex: 1, padding: 10, background: '#0b1220', border: '1px solid #334155',
                borderRadius: 6, color: '#e2e8f0',
              }}
            />
            <button className="btn" onClick={handleBudgetSave}>Save</button>
          </div>
        </div>

        <div className="grid">
          <div>
            <div className="tabs">
              <div className={`tab ${tab === 'scan' ? 'active' : ''}`} onClick={() => setTab('scan')}>📸 Scan Receipt</div>
              <div className={`tab ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>✏️ Manual Entry</div>
            </div>

            {tab === 'scan' ? (
              <ReceiptUpload onSaved={handleExpenseSaved} />
            ) : (
              <ManualExpenseForm onSaved={handleExpenseSaved} />
            )}

            <div className="card">
              <h3>This Month's Expenses</h3>
              <ExpenseList expenses={expenses} onDeleted={handleExpenseDeleted} />
            </div>
          </div>

          <div>
            <AnalyticsCharts summary={summary} trend={trend} />
          </div>
        </div>
      </div>
    </div>
  );
}
