import React, { useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['groceries', 'dining', 'transport', 'utilities', 'shopping', 'health', 'entertainment', 'rent', 'other'];

export default function ReceiptUpload({ onSaved }) {
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setPreview(URL.createObjectURL(file));
    setDraft(null);
    setScanning(true);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const { data } = await api.post('/expenses/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDraft({
        merchant: data.draft.merchant || '',
        amount: data.draft.amount || '',
        category: data.draft.category || 'other',
        note: '',
        expenseDate: new Date().toISOString().split('T')[0],
        receiptImagePath: data.draft.receiptImagePath,
        ocrRawText: data.draft.ocrRawText,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'OCR scan failed. You can still enter the expense manually below.');
      setDraft({
        merchant: '', amount: '', category: 'other', note: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    } finally {
      setScanning(false);
    }
  };

  const handleDraftChange = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/expenses', { ...draft, source: 'receipt_scan' });
      onSaved(data.expense);
      setDraft(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h3>📸 Scan a Receipt</h3>

      <label className="upload-zone">
        <input type="file" accept="image/*" onChange={handleFileSelect} />
        {preview ? (
          <img src={preview} alt="Receipt preview" className="receipt-preview" />
        ) : (
          <p>Click to upload a receipt photo (JPG/PNG)</p>
        )}
      </label>

      {scanning && <p style={{ color: '#94a3b8', fontSize: 13 }}>🔍 Reading receipt with OCR...</p>}
      {error && <p className="error-text">{error}</p>}

      {draft && (
        <form onSubmit={handleSave}>
          <span className="ocr-badge">Auto-filled from receipt — review before saving</span>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Merchant</label>
            <input name="merchant" value={draft.merchant} onChange={handleDraftChange} placeholder="e.g. Shwapno Supermarket" />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input name="amount" type="number" step="0.01" value={draft.amount} onChange={handleDraftChange} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={draft.category} onChange={handleDraftChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input name="expenseDate" type="date" value={draft.expenseDate} onChange={handleDraftChange} required />
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <input name="note" value={draft.note} onChange={handleDraftChange} />
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      )}
    </div>
  );
}
