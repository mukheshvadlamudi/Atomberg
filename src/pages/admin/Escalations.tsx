import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EscalationRule } from '../../types';
import { Bell, Save, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export default function Escalations() {
  const { escalationRules, updateEscalationRules, users, goalSheets, activeCycle } = useApp();
  const [rules, setRules] = useState<EscalationRule[]>(escalationRules);
  const [saved, setSaved] = useState(false);

  const typeLabels: Record<EscalationRule['type'], string> = {
    goal_not_submitted: 'Goal Not Submitted',
    goal_not_approved:  'Goal Not Approved by Manager',
    checkin_not_done:   'Quarterly Check-in Not Done',
  };
  const typeIcons: Record<EscalationRule['type'], React.ReactNode> = {
    goal_not_submitted: <Send size={18} />,
    goal_not_approved:  <CheckCircle size={18} />,
    checkin_not_done:   <Bell size={18} />,
  };

  const updateRule = (id: string, field: keyof EscalationRule, val: EscalationRule[keyof EscalationRule]) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));

  const handleSave = () => { updateEscalationRules(rules); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const now = new Date();
  const employees = users.filter(u => u.role === 'employee');
  const notSubmitted = employees.filter(emp => {
    const sheet = goalSheets.find(s => s.employeeId === emp.id && s.cycleId === activeCycle?.id);
    return !sheet || sheet.status === 'draft';
  });
  const notApproved = goalSheets.filter(s => {
    if (s.cycleId !== activeCycle?.id || s.status !== 'submitted') return false;
    if (!s.submittedAt) return false;
    const days = (now.getTime() - new Date(s.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
    const rule = rules.find(r => r.type === 'goal_not_approved' && r.isActive);
    return rule && days >= rule.daysThreshold;
  });

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Escalation Rules</div>
          <div className="section-sub">Configure auto-escalation rules and view triggered alerts</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave}><Save size={14} /> Save Rules</button>
      </div>

      {saved && <div className="alert alert-success"><CheckCircle size={15} /> Escalation rules saved!</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Rule Configuration</div>
        {rules.map(rule => (
          <div key={rule.id} style={{ padding: '14px 16px', marginBottom: 10, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: `1px solid ${rule.isActive ? 'rgba(99,102,241,0.3)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--accent-light)' }}>{typeIcons[rule.type]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{typeLabels[rule.type]}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Escalate if not done within
                    <input type="number" min={1} max={30} value={rule.daysThreshold}
                      onChange={e => updateRule(rule.id, 'daysThreshold', Number(e.target.value))}
                      style={{ width: 55, margin: '0 6px', padding: '2px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                    /> days
                  </div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={rule.isActive} onChange={e => updateRule(rule.id, 'isActive', e.target.checked)} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: rule.isActive ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Triggered Escalations</div>
        {notSubmitted.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 8 }}>
              <Send size={13} /> Goal Sheet Not Submitted ({notSubmitted.length})
            </div>
            {notSubmitted.map(emp => (
              <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
                <span className="notif-dot" />
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{emp.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {emp.department}</span>
              </div>
            ))}
          </div>
        )}
        {notApproved.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>
              <AlertTriangle size={13} /> Awaiting Manager Approval Too Long ({notApproved.length})
            </div>
            {notApproved.map(s => {
              const emp = users.find(u => u.id === s.employeeId);
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 6 }}>
                  <span className="notif-dot" style={{ background: 'var(--danger)' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{emp?.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</span>
                </div>
              );
            })}
          </div>
        )}
        {notSubmitted.length === 0 && notApproved.length === 0 && (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-icon"><CheckCircle size={36} strokeWidth={1} /></div>
            <div className="empty-title">No Active Escalations</div>
            <div className="empty-desc">Everything is on track!</div>
          </div>
        )}
      </div>
    </div>
  );
}
