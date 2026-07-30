import React from 'react';
import api from '../services/api';

export default function ExpenseList({ expenses, onDeleted }) {
  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    onDeleted(id);
  };

  if (!expenses.length) {
    return <p style={{ color: '#94a3b8', fontSize: 14 }}>No expenses yet this month. Add one to get started!</p>;
  }

  return (
    <ul className="expense-list">
      {expenses.map((exp) => (
        <li key={exp.id} className="expense-item">
          <div className="expense-main">
            <span className="merchant">
              {exp.merchant || 'Unnamed expense'}
              <span className="category-tag">{exp.category}</span>
              {exp.source === 'receipt_scan' && <span className="ocr-badge" style={{ marginLeft: 6 }}>OCR</span>}
            </span>
            <span className="meta">{exp.expenseDate}{exp.note ? ` · ${exp.note}` : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="expense-amount">৳{parseFloat(exp.amount).toFixed(2)}</span>
            <button className="btn secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(exp.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
