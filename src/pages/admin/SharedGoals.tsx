import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SharedGoalTemplate } from '../../types';
import { UOM_LABELS, THRUST_AREAS } from '../../data/seed';
import { UoMType } from '../../types';
import { Plus, Link2, Trash2, Users, Ruler, Target, Info, CheckCircle, X, Send } from 'lucide-react';

export default function SharedGoals() {
  const { currentUser, users, activeCycle, pushSharedGoal, removeSharedGoal, sharedGoalTemplates, logAudit } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ thrustArea: '', title: '', description: '', uom: 'percent_min' as UoMType, target: '' as string | number, weightage: 10, selectedEmps: [] as string[] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  if (!currentUser || !activeCycle) return null;

  const allEmployees = users.filter(u => u.role === 'employee');
  const myTemplates = sharedGoalTemplates.filter(t => t.pushedBy === currentUser.id || currentUser.role === 'admin');

  const toggleEmp = (id: string) =>
    setForm(p => ({ ...p, selectedEmps: p.selectedEmps.includes(id) ? p.selectedEmps.filter(e => e !== id) : [...p.selectedEmps, id] }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.thrustArea) e.thrustArea = 'Required';
    if (!form.title.trim()) e.title = 'Required';
    if (!form.target) e.target = 'Required';
    if (form.weightage < 1 || form.weightage > 100) e.weightage = 'Must be between 1 and 100';
    if (form.selectedEmps.length === 0) e.emps = 'Select at least one recipient';
    return e;
  };

  const handlePush = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const template: SharedGoalTemplate = {
      id: `sgt-${Date.now()}`, thrustArea: form.thrustArea, title: form.title, description: form.description,
      uom: form.uom, target: form.uom === 'timeline' ? form.target : Number(form.target),
      weightage: form.weightage, pushedBy: currentUser.id, pushedTo: form.selectedEmps,
      cycleId: activeCycle.id, createdAt: new Date().toISOString(),
    };
    pushSharedGoal(template);
    logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'SHARED_GOAL_PUSHED', entityType: 'SharedGoalTemplate', entityId: template.id, after: `Pushed to ${form.selectedEmps.length} employees` });
    setShowModal(false);
    setSuccess(`Shared goal pushed to ${form.selectedEmps.length} employee(s).`);
    setForm({ thrustArea: '', title: '', description: '', uom: 'percent_min', target: '', weightage: 10, selectedEmps: [] });
  };

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Shared Goals</div>
          <div className="section-sub">Push departmental KPIs to multiple employees</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Push Shared Goal</button>
      </div>

      {success && <div className="alert alert-success"><CheckCircle size={15} /> {success}</div>}

      {myTemplates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Link2 size={40} strokeWidth={1} /></div>
          <div className="empty-title">No Shared Goals Yet</div>
          <div className="empty-desc">Push a departmental KPI goal to multiple employees at once.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {myTemplates.map(t => {
            const pusher = users.find(u => u.id === t.pushedBy);
            return (
              <div key={t.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', marginBottom: 4 }}>{t.thrustArea}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{t.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{t.description}</div>
                    <div className="goal-meta" style={{ marginTop: 10 }}>
                      <span className="goal-meta-item"><Ruler size={11} /> {UOM_LABELS[t.uom]}</span>
                      <span className="goal-meta-item"><Target size={11} /> {t.target}</span>
                      <span className="goal-meta-item"><Users size={11} /> {t.pushedTo.length} recipients</span>
                      <span className="goal-meta-item">By: {pusher?.name}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16, flexShrink: 0 }}>
                    <span className="badge badge-on_track">Active</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeSharedGoal(t.id)}><Trash2 size={13} /> Delete</button>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {t.pushedTo.map(eid => {
                    const emp = users.find(u => u.id === eid);
                    return <span key={eid} className="chip">{emp?.name ?? eid}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">Push Shared Goal</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <Info size={14} /> The shared goal will be added to each recipient's sheet. Existing goal weightages will be <strong>automatically scaled down proportionally</strong> to keep the total at 100%.
              </div>
              <div className="form-group">
                <label className="form-label">Thrust Area *</label>
                <select className="form-select" value={form.thrustArea} onChange={e => setForm(p => ({ ...p, thrustArea: e.target.value }))}>
                  <option value="">Select</option>
                  {THRUST_AREAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.thrustArea && <div className="form-error">{errors.thrustArea}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Goal Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Zero Safety Incidents" />
                {errors.title && <div className="form-error">{errors.title}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">UoM *</label>
                  <select className="form-select" value={form.uom} onChange={e => setForm(p => ({ ...p, uom: e.target.value as UoMType }))}>
                    {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target *</label>
                  {form.uom === 'timeline'
                    ? <input className="form-input" type="date" value={form.target as string} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
                    : <input className="form-input" type="number" value={form.target as string} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
                  }
                  {errors.target && <div className="form-error">{errors.target}</div>}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Default Weightage (%) * <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>Applied to each recipient's sheet</span></label>
                <input className="form-input" type="number" min={1} max={100} value={form.weightage} onChange={e => setForm(p => ({ ...p, weightage: Number(e.target.value) }))} placeholder="10" />
                {errors.weightage && <div className="form-error">{errors.weightage}</div>}
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Push To (select employees) *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                  {allEmployees.map(emp => (
                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: form.selectedEmps.includes(emp.id) ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                      <input type="checkbox" checked={form.selectedEmps.includes(emp.id)} onChange={() => toggleEmp(emp.id)} style={{ accentColor: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.department}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.emps && <div className="form-error">{errors.emps}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePush}><Send size={14} /> Push Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
