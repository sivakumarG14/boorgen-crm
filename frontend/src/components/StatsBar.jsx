import React from 'react';

const STATS = [
  { key: 'total',     label: 'Total Leads',  icon: '◈', color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  { key: 'new',       label: 'New',          icon: '◉', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  { key: 'contacted', label: 'Contacted',    icon: '✦', color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  { key: 'failed',    label: 'Failed',       icon: '✕', color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
];

export default function StatsBar({ stats }) {
  return (
    <div style={s.grid}>
      {STATS.map((item) => (
        <div key={item.key} style={s.card}>
          <div style={{ ...s.iconWrap, background: item.bg, color: item.color }}>
            {item.icon}
          </div>
          <div>
            <p style={{ ...s.value, color: item.color }}>{stats[item.key] ?? 0}</p>
            <p style={s.label}>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 28,
  },
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    transition: 'border-color 0.2s',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, flexShrink: 0,
  },
  value: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  label: { fontSize: 12, color: 'var(--text2)', marginTop: 4, fontWeight: 500 },
};
