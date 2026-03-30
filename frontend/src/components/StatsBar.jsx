import React from 'react';

const STATS = [
  { key: 'total',           label: 'Total',          icon: '◈', color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  { key: 'cold',            label: 'Cold',            icon: '❄', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  { key: 'engaged',         label: 'Engaged',         icon: '◉', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  { key: 'microCommitment', label: 'Micro-Commit',    icon: '✦', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  { key: 'callScheduled',   label: 'Call Scheduled',  icon: '📅', color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  { key: 'noInterest',      label: 'No Interest',     icon: '✕', color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  { key: 'highPriority',    label: 'High Priority',   icon: '🔥', color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  value: { fontSize: 24, fontWeight: 800, lineHeight: 1 },
  label: { fontSize: 11, color: 'var(--text2)', marginTop: 3, fontWeight: 500 },
};
