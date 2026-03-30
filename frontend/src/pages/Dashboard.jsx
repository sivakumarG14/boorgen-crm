import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AddLeadForm from '../components/AddLeadForm';
import LeadsTable from '../components/LeadsTable';
import StatsBar from '../components/StatsBar';

export default function Dashboard() {
  const [leads, setLeads]           = useState([]);
  const [stats, setStats]           = useState({});
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/leads', { params });
      setLeads(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try { const { data } = await api.get('/stats'); setStats(data); }
    catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchLeads(); fetchStats(); }, [fetchLeads, fetchStats]);

  const refresh = () => { fetchLeads(); fetchStats(); };

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  return (
    <div style={s.layout}>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>B</div>
            <div>
              <p style={s.logoText}>BOORGEN</p>
              <p style={s.logoSub}>AI Outreach</p>
            </div>
          </div>

          <nav style={s.nav}>
            <div style={s.navItem}>
              <span style={s.navIcon}>◈</span> Dashboard
            </div>
          </nav>
        </div>

        <div style={s.sideBottom}>
          <button
            onClick={logout}
            style={s.logoutBtn}
          >
            ← Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Lead Outreach CRM</h1>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ height: 42, padding: '0 20px' }}
          >
            {showForm ? '✕ Cancel' : '+ Add Lead'}
          </button>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Add Lead Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <AddLeadForm onSuccess={() => { setShowForm(false); refresh(); }} />
          </div>
        )}

        {/* Filters */}
        <div style={s.filterBar}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>⌕</span>
            <input
              placeholder="Search name, email, hotel, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, background: 'var(--bg2)' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: 160, background: 'var(--bg2)' }}
          >
            <option value="">All Statuses</option>
            <option value="Cold">Cold</option>
            <option value="Engaged">Engaged</option>
            <option value="Micro-Commitment">Micro-Commitment</option>
            <option value="Qualified">Qualified</option>
            <option value="Call Scheduled">Call Scheduled</option>
            <option value="No Interest">No Interest</option>
            <option value="Cold – Re-Engage">Cold – Re-Engage</option>
            <option value="Closed / Lost">Closed / Lost</option>
          </select>
          {(search || statusFilter) && (
            <button className="btn-ghost" onClick={() => { setSearch(''); setStatus(''); }} style={{ height: 42, padding: '0 16px' }}>
              Clear
            </button>
          )}
          <span style={s.count}>
            {loading ? 'Loading...' : `${leads.length} lead${leads.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Table */}
        <LeadsTable leads={leads} onUpdated={refresh} />
      </main>
    </div>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },

  sidebar: {
    width: 240, flexShrink: 0,
    background: 'var(--bg2)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '28px 16px',
  },
  sideTop: { display: 'flex', flexDirection: 'column', gap: 32 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 4 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 9,
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 800, color: '#fff',
    boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
  },
  logoText: { fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.06em' },
  logoSub: { fontSize: 11, color: 'var(--text3)', marginTop: 1 },

  nav: { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    fontSize: 13, fontWeight: 600, color: 'var(--text)',
    background: 'var(--accent-glow)', cursor: 'default',
  },
  navItemMuted: { background: 'transparent', color: 'var(--text3)', fontWeight: 500 },
  navIcon: { fontSize: 14, width: 18, textAlign: 'center' },

  sideBottom: { display: 'flex', flexDirection: 'column', gap: 8 },
  statusDot: { display: 'flex', alignItems: 'center', gap: 8 },
  greenDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: 'var(--green)',
    boxShadow: '0 0 6px rgba(34,197,94,0.6)',
  },
  logoutBtn: {
    background: 'transparent', color: 'var(--text3)',
    border: '1px solid var(--border)', borderRadius: 8,
    padding: '8px 14px', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', width: '100%', textAlign: 'left',
    transition: 'color 0.2s',
  },

  main: { flex: 1, padding: '36px 40px', overflowY: 'auto', maxWidth: '100%' },

  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28,
  },
  pageTitle: { fontSize: 26, fontWeight: 800, color: 'var(--text)' },
  pageSub: { fontSize: 14, color: 'var(--text2)', marginTop: 4 },

  filterBar: {
    display: 'flex', gap: 12, marginBottom: 20,
    alignItems: 'center', flexWrap: 'wrap',
  },
  searchWrap: { position: 'relative', flex: 1, minWidth: 240 },
  searchIcon: {
    position: 'absolute', left: 12, top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text3)', fontSize: 16, pointerEvents: 'none',
  },
  count: { marginLeft: 'auto', fontSize: 13, color: 'var(--text3)', whiteSpace: 'nowrap' },

  footer: {
    marginTop: 40, textAlign: 'center',
    fontSize: 12, color: 'var(--text3)',
    borderTop: '1px solid var(--border)', paddingTop: 20,
  },
};
