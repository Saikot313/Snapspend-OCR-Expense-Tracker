import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8', '#facc15', '#94a3b8'];

export default function AnalyticsCharts({ summary, trend }) {
  const budgetUsedPct = summary.monthlyBudget > 0
    ? Math.min(100, Math.round((summary.totalSpent / summary.monthlyBudget) * 100))
    : null;

  return (
    <>
      <div className="card">
        <h3>Spending by Category</h3>
        {summary.categoryBreakdown.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={summary.categoryBreakdown}
                dataKey="total"
                nameKey="category"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {summary.categoryBreakdown.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `৳${value}`} contentStyle={{ background: '#131c31', border: '1px solid #253150' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>No data yet for this month.</p>
        )}
      </div>

      <div className="card">
        <h3>Last 6 Months Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#253150" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip formatter={(value) => `৳${value}`} contentStyle={{ background: '#131c31', border: '1px solid #253150' }} />
            <Bar dataKey="total" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {budgetUsedPct !== null && (
        <div className="card">
          <h3>Budget Usage</h3>
          <div style={{ background: '#0b1220', borderRadius: 8, height: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: `${budgetUsedPct}%`,
                height: '100%',
                background: budgetUsedPct >= 100 ? '#ef4444' : '#34d399',
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            {budgetUsedPct}% of ৳{summary.monthlyBudget} monthly budget used
          </p>
        </div>
      )}
    </>
  );
}
