import React, { useState } from 'react';
import api from '../api';

const EMPTY = { name: '', email: '', hotel: '', location: '', language: 'de', notes: '' };

export default function AddLeadForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/add-lead', form);
      setSuccess('Lead added. Cold contact email sent automatically.');
      setForm(EMPTY);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.header}>
        <h3 style={s.title}>Add New Lead</h3>
        <p style={s.sub}>Cold contact email (Flow 1) will be sent automatically</p>
      </div>
      <div style={s.grid}>
        {[
          { name: 'name',     placeholder: 'Contact Name',    required: true },
          { name: 'email',    placeholder: 'Email Address',   required: true, type: 'email' },
          { name: 'hotel',    placeholder: 'Hotel Name',      required: true },
          { name: 'location', placeholder: 'City / Location', required: true },
        ].map((f) => (
          <div key={f.name} style={s.field}>
            <label style={s.label}>{f.placeholder}</label>
            <input name={f.name} type={f.type || 'text'} placeholder={f.placeholder}
              required={f.required} value={form[f.name]} onChange={handleChange} />
          </div>
        ))}
      </div>
      <div style={{ ...s.grid, marginTop: 10 }}>
        <div style={s.field}>
          <label style={s.label}>Language</label>
          <select name="language" value={form.language} onChange={handleChange}>
            <option value="de">Deutsch (DE)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Notes (optional)</label>
          <input name="notes" placeholder="Additional notes..." value={form.notes} onChange={handleChange} />
        </div>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">✓ {success}</p>}
      <div style={{ marginTop: 16 }}>
        <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '10px 24px' }}>
          {loading ? 'Adding...' : '+ Add Lead → Start Funnel'}
        </button>
      </div>
    </form>
  );
}

const s = {
  header: { marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  sub: { fontSize: 12, color: 'var(--text2)', marginTop: 3 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text2)' },
};
