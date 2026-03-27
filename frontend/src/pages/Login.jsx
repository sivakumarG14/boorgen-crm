import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/login', form);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Background glow */}
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>B</div>
          <div>
            <h1 style={s.logo}>BOORGEN</h1>
          </div>
        </div>

        <h2 style={s.title}>Welcome back</h2>
        <p style={s.subtitle}>Sign in to your dashboard</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@boorgen.com"
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-msg" style={{ textAlign: 'center' }}>{error}</p>}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 4 }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={s.footer}></p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  glow1: {
    position: 'absolute', top: '-20%', left: '-10%',
    width: 600, height: 600,
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute', bottom: '-20%', right: '-10%',
    width: 500, height: 500,
    background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: 420,
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '40px 36px',
    boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
    position: 'relative', zIndex: 1,
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 800, color: '#fff',
    boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
  },
  logo: { fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.05em' },
  logoSub: { fontSize: 11, color: 'var(--text3)', marginTop: 1 },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'var(--text2)', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text2)' },
  footer: { textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 28 },
};
