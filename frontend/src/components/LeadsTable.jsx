import React, { useState } from 'react';
import api from '../api';

const STATUS = {
  New:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  Contacted: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   dot: '#22c55e' },
  Failed:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
};

export default function LeadsTable({ leads, onUpdated }) {
  const [editing, setEditing]   = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving]     = useState(false);
  const [sending, setSending]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const startEdit = (lead) => {
    setEditing(lead._id);
    setEditData({ status: lead.status, notes: lead.notes || '' });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await api.post('/update-lead', { leadId: id, ...editData });
      setEditing(null);
      onUpdated();
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (lead) => {
    if (!window.confirm(`Send AI outreach email to ${lead.name}?`)) return;
    setSending(lead._id);
    try {
      await api.post('/send-outreach', { leadId: lead._id, type: 'initial' });
      onUpdated();
    } catch (err) {
      alert(err.response?.data?.error || 'Outreach failed');
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete "${lead.name}"?`)) return;
    setDeleting(lead._id);
    try {
      await api.delete(`/delete-lead/${lead._id}`);
      onUpdated();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  if (!leads.length) {
    return (
      <div style={s.empty}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>◈</p>
        <p style={{ color: 'var(--text2)', fontWeight: 600 }}>No leads yet</p>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>Add your first lead to get started</p>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {['Lead', 'Hotel', 'Location', 'Status', 'Notes', 'Added', 'Actions'].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const st = STATUS[lead.status] || STATUS.New;
            const isEditing = editing === lead._id;
            return (
              <tr key={lead._id} style={{ ...s.row, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>

                {/* Lead */}
                <td style={s.td}>
                  <div style={s.leadName}>{lead.name}</div>
                  <div style={s.leadEmail}>{lead.email}</div>
                </td>

                {/* Hotel */}
                <td style={s.td}>
                  <span style={s.hotelTag}>{lead.hotel}</span>
                </td>

                {/* Location */}
                <td style={s.td}>
                  <span style={s.location}>📍 {lead.location}</span>
                </td>

                {/* Status */}
                <td style={s.td}>
                  {isEditing ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      style={{ padding: '6px 10px', width: 'auto', fontSize: 13 }}
                    >
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Failed</option>
                    </select>
                  ) : (
                    <span style={{ ...s.badge, background: st.bg, color: st.color }}>
                      <span style={{ ...s.dot, background: st.dot }} />
                      {lead.status}
                    </span>
                  )}
                </td>

                {/* Notes */}
                <td style={s.td}>
                  {isEditing ? (
                    <input
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      style={{ padding: '6px 10px', fontSize: 13 }}
                      placeholder="Add notes..."
                    />
                  ) : (
                    <span style={s.notes}>{lead.notes || '—'}</span>
                  )}
                </td>

                {/* Date */}
                <td style={s.td}>
                  <span style={s.date}>{new Date(lead.createdAt).toLocaleDateString('de-DE')}</span>
                </td>

                {/* Actions */}
                <td style={{ ...s.td, minWidth: 200 }}>
                  {isEditing ? (
                    <div style={s.actions}>
                      <button className="btn-primary" onClick={() => saveEdit(lead._id)} disabled={saving} style={s.btn}>
                        {saving ? '...' : 'Save'}
                      </button>
                      <button className="btn-ghost" onClick={() => setEditing(null)} style={s.btn}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={s.actions}>
                      {lead.status !== 'Contacted' && (
                        <button
                          className="btn-success"
                          onClick={() => handleSend(lead)}
                          disabled={sending === lead._id}
                          style={s.btn}
                          title="Generate AI email & send"
                        >
                          {sending === lead._id ? '⏳' : '✉ Send'}
                        </button>
                      )}
                      <button className="btn-ghost" onClick={() => startEdit(lead)} style={s.btn}>
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(lead)}
                        disabled={deleting === lead._id}
                        style={s.btn}
                      >
                        {deleting === lead._id ? '...' : '✕'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  wrap: { overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--bg2)' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: 11, fontWeight: 600, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    background: 'var(--bg3)', borderBottom: '1px solid var(--border)',
  },
  row: { borderBottom: '1px solid rgba(42,49,71,0.5)', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: 13, verticalAlign: 'middle' },
  leadName: { fontWeight: 600, color: 'var(--text)', fontSize: 14 },
  leadEmail: { color: 'var(--text3)', fontSize: 12, marginTop: 2 },
  hotelTag: {
    background: 'rgba(99,102,241,0.1)', color: 'var(--accent2)',
    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
  },
  location: { color: 'var(--text2)', fontSize: 13 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  dot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  notes: { color: 'var(--text3)', fontSize: 12, maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  date: { color: 'var(--text3)', fontSize: 12 },
  actions: { display: 'flex', gap: 6, alignItems: 'center' },
  btn: { padding: '5px 12px', fontSize: 12 },
  empty: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '60px 20px',
    textAlign: 'center',
  },
};
