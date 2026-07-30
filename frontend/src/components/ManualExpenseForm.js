import React, { useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['groceries', 'dining', 'transport', 'utilities', 'shopping', 'health', 'entertainment', 'rent', 'other'];

export default function ManualExpenseForm({ onSaved }) {
  const [form, setForm] = useState({
    merchant: '', amount: '', category: 'other', note: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/expenses', { ...form, source: 'manual' });
      onSaved(data.expense);
      setForm({ merchant: '', amount: '', category: 'other', note: '', expenseDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3>✏️ Add Expense Manually</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Merchant</label>
          <input name="merchant" value={form.merchant} onChange={handleChange} placeholder="e.g. Uber" />
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input name="expenseDate" type="date" value={form.expenseDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Note (optional)</label>
          <input name="note" value={form.note} onChange={handleChange} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn" style={{ width: '100%' }} disabled={saving}>
          {saving ? 'Saving...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}
