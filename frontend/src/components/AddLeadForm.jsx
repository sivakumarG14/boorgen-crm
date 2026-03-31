import React, { useState } from 'react';
import api from '../api';

const EMPTY = { name: '', email: '', hotel: '', location: '', language: 'de', notes: '' };

const I18N = {
  de: {
    title: 'Neuen Lead hinzufügen',
    sub: 'Kaltakquise-E-Mail (Flow 1) wird automatisch versendet',
    fields: [
      { name: 'name',     label: 'Kontaktname',    placeholder: 'Max Mustermann',    icon: 'person',      required: true },
      { name: 'email',    label: 'E-Mail-Adresse',  placeholder: 'max@hotel.de',      icon: 'mail',        required: true, type: 'email' },
      { name: 'hotel',    label: 'Hotelname',       placeholder: 'Hotel Alpenblick',  icon: 'hotel',       required: true },
      { name: 'location', label: 'Stadt / Standort',placeholder: 'München, DE',       icon: 'location_on', required: true },
    ],
    langLabel: 'Sprache',
    notesLabel: 'Notizen (optional)',
    notesPlaceholder: 'Zusätzliche Notizen...',
    submit: 'Lead hinzufügen → Funnel starten',
    submitting: 'Hinzufügen...',
    success: 'Lead hinzugefügt. Kaltakquise-E-Mail wurde automatisch versendet.',
    error: 'Fehler beim Hinzufügen des Leads.',
  },
  en: {
    title: 'Add New Lead',
    sub: 'Cold outreach email (Flow 1) will be sent automatically',
    fields: [
      { name: 'name',     label: 'Contact Name',   placeholder: 'John Smith',        icon: 'person',      required: true },
      { name: 'email',    label: 'Email Address',   placeholder: 'john@hotel.com',    icon: 'mail',        required: true, type: 'email' },
      { name: 'hotel',    label: 'Hotel Name',      placeholder: 'Grand Hotel',       icon: 'hotel',       required: true },
      { name: 'location', label: 'City / Location', placeholder: 'Berlin, DE',        icon: 'location_on', required: true },
    ],
    langLabel: 'Language',
    notesLabel: 'Notes (optional)',
    notesPlaceholder: 'Additional notes...',
    submit: 'Add Lead → Start Funnel',
    submitting: 'Adding...',
    success: 'Lead added. Cold outreach email has been sent automatically.',
    error: 'Failed to add lead.',
  },
};

export default function AddLeadForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const t = I18N[form.language] || I18N.de;
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/add-lead', form);
      setSuccess(t.success);
      setForm(EMPTY);
      setTimeout(onSuccess, 1200);
    } catch (err) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ animation: 'scaleIn 0.3s var(--ease) both' }}>
      <div style={s.header}>
        <div style={s.headerIcon}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--brand-gold)' }}>person_add</span>
        </div>
        <div>
          <h3 style={s.title}>{t.title}</h3>
          <p style={s.sub}>{t.sub}</p>
        </div>
      </div>

      {/* Language selector first so labels update immediately */}
      <div style={{ marginBottom: 14 }}>
        <label style={s.label}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, opacity: 0.6 }}>translate</span>
          {t.langLabel}
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          {['de', 'en'].map(lang => (
            <div key={lang} onClick={() => setForm({ ...form, language: lang })}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                fontSize: 13, fontWeight: 600,
                border: `1px solid ${form.language === lang ? 'var(--brand-gold)' : 'var(--border)'}`,
                background: form.language === lang ? 'var(--brand-gold-glow)' : 'var(--bg3)',
                color: form.language === lang ? 'var(--brand-gold)' : 'var(--text3)',
                transition: 'all 0.15s var(--ease)',
              }}>
              {lang === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
            </div>
          ))}
        </div>
      </div>

      <div style={s.grid}>
        {t.fields.map((f) => (
          <div key={f.name} style={s.field}>
            <label style={s.label}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, opacity: 0.6 }}>{f.icon}</span>
              {f.label}
            </label>
            <input
              id={`add-lead-${f.name}`}
              name={f.name}
              type={f.type || 'text'}
              placeholder={f.placeholder}
              required={f.required}
              value={form[f.name]}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={s.field}>
          <label style={s.label}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, opacity: 0.6 }}>edit_note</span>
            {t.notesLabel}
          </label>
          <input name="notes" placeholder={t.notesPlaceholder} value={form.notes} onChange={handleChange} />
        </div>
      </div>

      {error && (
        <p className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>error</span>{error}
        </p>
      )}
      {success && (
        <p className="success-msg" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check_circle</span>{success}
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <button id="add-lead-submit" className="btn-primary" type="submit" disabled={loading}
          style={{ padding: '11px 28px', fontSize: 13, borderRadius: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {loading ? 'sync' : 'rocket_launch'}
            </span>
            {loading ? t.submitting : t.submit}
          </span>
        </button>
      </div>
    </form>
  );
}

const s = {
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' },
  headerIcon: { width: 40, height: 40, borderRadius: 10, background: 'var(--brand-gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: "'Outfit', sans-serif" },
  sub: { fontSize: 12, color: 'var(--text2)', marginTop: 2 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.05em' },
};
