import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cycle, CycleWindow } from '../../types';
import { Plus, Edit2, Save, X, CheckCircle, Target, ClipboardList, Trophy } from 'lucide-react';

const windowSections: { key: keyof Omit<Cycle, 'id' | 'name' | 'year' | 'isActive'>; label: string; icon: React.ReactNode }[] = [
  { key: 'goalSettingWindow', label: 'Phase 1 — Goal Setting', icon: <Target size={13} /> },
  { key: 'Q1', label: 'Q1 Check-in (July)',    icon: <ClipboardList size={13} /> },
  { key: 'Q2', label: 'Q2 Check-in (October)', icon: <ClipboardList size={13} /> },
  { key: 'Q3', label: 'Q3 Check-in (January)', icon: <ClipboardList size={13} /> },
  { key: 'Q4', label: 'Q4 / Annual (Mar–Apr)', icon: <Trophy size={13} /> },
];

export default function CycleConfig() {
  const { cycles, saveCycle, logAudit, currentUser } = useApp();
  const [editing, setEditing] = useState<Cycle | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!editing || !currentUser) return;
    saveCycle(editing);
    logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'CYCLE_UPDATED', entityType: 'Cycle', entityId: editing.id, after: 'Cycle windows updated' });
    setSaved(true); setEditing(null);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateWindow = (key: keyof Omit<Cycle, 'id' | 'name' | 'year' | 'isActive'>, field: 'opens' | 'closes', value: string) => {
    if (!editing) return;
    setEditing(prev => prev ? { ...prev, [key]: { ...(prev[key] as CycleWindow), [field]: value } } : prev);
  };

  const createNew = () => {
    setEditing({ id: `cycle-${Date.now()}`, name: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, year: new Date().getFullYear() + 1, isActive: false, goalSettingWindow: { opens: '', closes: '' }, Q1: { opens: '', closes: '' }, Q2: { opens: '', closes: '' }, Q3: { opens: '', closes: '' }, Q4: { opens: '', closes: '' } });
  };

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Cycle Configuration</div>
          <div className="section-sub">Manage check-in windows and goal setting periods</div>
        </div>
        <button className="btn btn-primary" onClick={createNew}><Plus size={15} /> New Cycle</button>
      </div>
      {saved && <div className="alert alert-success"><CheckCircle size={15} /> Cycle saved successfully!</div>}
      {cycles.map(cycle => (
        <div key={cycle.id} className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{cycle.name}</span>
                {cycle.isActive && <span className="badge badge-approved">Active</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>FY {cycle.year}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...cycle })}><Edit2 size={13} /> Edit Windows</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {windowSections.map(({ key, label, icon }) => {
              const w = cycle[key] as CycleWindow;
              return (
                <div key={key} style={{ padding: '12px 14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{icon} {label}</div>
                  <div style={{ fontSize: 12.5 }}>Opens: <strong>{w.opens || '—'}</strong></div>
                  <div style={{ fontSize: 12.5 }}>Closes: <strong>{w.closes || '—'}</strong></div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {editing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">Edit Cycle: {editing.name}</div>
              <button className="modal-close" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cycle Name</label>
                  <input className="form-input" value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Year</label>
                  <input className="form-input" type="number" value={editing.year} onChange={e => setEditing(p => p ? { ...p, year: Number(e.target.value) } : p)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={editing.isActive} onChange={e => setEditing(p => p ? { ...p, isActive: e.target.checked } : p)} style={{ accentColor: 'var(--accent)' }} />
                  Set as Active Cycle
                </label>
              </div>
              {windowSections.map(({ key, label, icon }) => {
                const w = editing[key] as CycleWindow;
                return (
                  <div key={key} style={{ marginBottom: 16, padding: 14, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13.5, marginBottom: 12 }}>{icon} {label}</div>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Opens</label>
                        <input className="form-input" type="date" value={w.opens} onChange={e => updateWindow(key, 'opens', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Closes</label>
                        <input className="form-input" type="date" value={w.closes} onChange={e => updateWindow(key, 'closes', e.target.value)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Save size={14} /> Save Cycle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
