import React, { useState } from 'react';
import api from '../api';

const STATUS_STYLE = {
  'Cold':             { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  'Engaged':          { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  'Micro-Commitment': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  'Qualified':        { color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  'Call Scheduled':   { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'   },
  'No Interest':      { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  'Cold – Re-Engage': { color: '#f97316', bg: 'rgba(249,115,22,0.12)'  },
  'Closed / Lost':    { color: '#475569', bg: 'rgba(71,85,105,0.12)'   },
};

const REPLY_TYPES = [
  { value: 'yes',     label: '✓ Yes / Interested' },
  { value: 'no',      label: '✕ No / Not interested' },
  { value: 'address', label: '📍 Sent address' },
  { value: 'question',label: '❓ Asked question' },
  { value: 'later',   label: '⏳ Maybe later' },
];

export default function LeadsTable({ leads, onUpdated }) {
  const [editing, setEditing]     = useState(null);
  const [editData, setEditData]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [replyModal, setReplyModal] = useState(null);
  const [replyType, setReplyType] = useState('yes');
  const [deleting, setDeleting]   = useState(null);
  const [callModal, setCallModal] = useState(null);
  const [callDate, setCallDate]   = useState('');

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await api.post('/update-lead', { leadId: id, ...editData });
      setEditing(null); onUpdated();
    } catch (err) { alert(err.response?.data?.error || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleReply = async () => {
    try {
      await api.post('/funnel/reply', { leadId: replyModal, replyType });
      setReplyModal(null); onUpdated();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleLinkClick = async (leadId) => {
    try {
      await api.post('/funnel/link-click', { leadId });
      onUpdated();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleScheduleCall = async () => {
    try {
      await api.post('/funnel/schedule-call', { leadId: callModal, callDate });
      setCallModal(null); onUpdated();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleNotifyAna = async (leadId) => {
    try {
      await api.post('/funnel/notify-ana', { leadId, message: 'Manual notification from CRM dashboard' });
      alert('Ana notified!');
    } catch (err) { alert('Failed to notify Ana'); }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete "${lead.name}"?`)) return;
    setDeleting(lead._id);
    try {
      await api.delete(`/delete-lead/${lead._id}`); onUpdated();
    } catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
    finally { setDeleting(null); }
  };

  if (!leads.length) {
    return (
      <div style={s.empty}>
        <p style={{ fontSize: 28, marginBottom: 10 }}>◈</p>
        <p style={{ color: 'var(--text2)', fontWeight: 600 }}>No leads yet</p>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>Add your first lead to start the funnel</p>
      </div>
    );
  }

  return (
    <>
      {/* Reply Modal */}
      {replyModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{ marginBottom: 16, color: 'var(--text)' }}>Mark Lead Reply</h3>
            <select value={replyType} onChange={(e) => setReplyType(e.target.value)} style={{ marginBottom: 16 }}>
              {REPLY_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleReply}>Process Reply</button>
              <button className="btn-ghost" onClick={() => setReplyModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Call Modal */}
      {callModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={{ marginBottom: 16, color: 'var(--text)' }}>Schedule Call</h3>
            <input type="datetime-local" value={callDate} onChange={(e) => setCallDate(e.target.value)} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleScheduleCall}>Schedule</button>
              <button className="btn-ghost" onClick={() => setCallModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Lead', 'Hotel', 'Status', 'Flow', 'Score', 'Last Email', 'Actions'].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const st = STATUS_STYLE[lead.status] || STATUS_STYLE['Cold'];
              const isEditing = editing === lead._id;
              const isHighPriority = lead.score >= 40;
              return (
                <tr key={lead._id} style={{ ...s.row, background: isHighPriority ? 'rgba(249,115,22,0.04)' : 'transparent' }}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isHighPriority && <span title="High Priority" style={{ color: '#f97316' }}>🔥</span>}
                      <div>
                        <div style={s.leadName}>{lead.name}</div>
                        <div style={s.leadEmail}>{lead.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.language?.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.hotelTag}>{lead.hotel}</span>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>📍 {lead.location}</div>
                  </td>
                  <td style={s.td}>
                    {isEditing ? (
                      <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        style={{ padding: '5px 8px', width: 'auto', fontSize: 12 }}>
                        {Object.keys(STATUS_STYLE).map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span style={{ ...s.badge, background: st.bg, color: st.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block', marginRight: 5 }} />
                        {lead.status}
                      </span>
                    )}
                  </td>
                  <td style={s.td}>
                    <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>Flow {lead.flow || 1}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: lead.score >= 40 ? '#f97316' : 'var(--text2)' }}>
                      {lead.score || 0}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {lead.lastEmailSent || '—'}
                      {lead.lastEmailDate && (
                        <div>{new Date(lead.lastEmailDate).toLocaleDateString('de-DE')}</div>
                      )}
                    </span>
                  </td>
                  <td style={{ ...s.td, minWidth: 260 }}>
                    {isEditing ? (
                      <div style={s.actions}>
                        <input value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          placeholder="Notes..." style={{ padding: '4px 8px', fontSize: 12, width: 120 }} />
                        <button className="btn-primary" onClick={() => saveEdit(lead._id)} disabled={saving} style={s.btn}>Save</button>
                        <button className="btn-ghost" onClick={() => setEditing(null)} style={s.btn}>✕</button>
                      </div>
                    ) : (
                      <div style={s.actions}>
                        <button className="btn-success" onClick={() => setReplyModal(lead._id)} style={s.btn} title="Mark reply">
                          Reply
                        </button>
                        <button className="btn-ghost" onClick={() => { setCallModal(lead._id); setCallDate(''); }} style={s.btn} title="Schedule call">
                          📅
                        </button>
                        <button className="btn-ghost" onClick={() => handleLinkClick(lead._id)} style={s.btn} title="Track link click">
                          🔗
                        </button>
                        <button className="btn-ghost" onClick={() => handleNotifyAna(lead._id)} style={s.btn} title="Notify Ana">
                          Ana
                        </button>
                        <button className="btn-ghost" onClick={() => { setEditing(lead._id); setEditData({ status: lead.status, notes: lead.notes || '' }); }} style={s.btn}>
                          Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(lead)} disabled={deleting === lead._id} style={s.btn}>
                          ✕
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
    </>
  );
}

const s = {
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--bg2)' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' },
  row: { borderBottom: '1px solid rgba(42,49,71,0.5)' },
  td: { padding: '12px 14px', fontSize: 13, verticalAlign: 'middle' },
  leadName: { fontWeight: 600, color: 'var(--text)', fontSize: 14 },
  leadEmail: { color: 'var(--text3)', fontSize: 12, marginTop: 1 },
  hotelTag: { background: 'rgba(99,102,241,0.1)', color: 'var(--accent2)', padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 500 },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  actions: { display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' },
  btn: { padding: '4px 9px', fontSize: 11 },
  empty: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '50px 20px', textAlign: 'center' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 4 },
};
