import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal, UoMType, GoalSheet } from '../../types';
import { THRUST_AREAS, UOM_LABELS } from '../../data/seed';
import { Plus, Send, Edit2, Trash2, Lock, RotateCcw, Link2, Scale, Ruler, Target, AlertTriangle, CheckCircle, Info, X, Save } from 'lucide-react';

function genId() { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function sheetId() { return `gs-${Date.now()}`; }

const EMPTY_GOAL = (): Omit<Goal, 'id' | 'sheetId' | 'actuals' | 'createdAt'> => ({
  thrustArea: '', title: '', description: '', uom: 'percent_min', target: 100, weightage: 10, isShared: false,
});

export default function GoalSheet() {
  const { currentUser, activeCycle, getSheet, saveSheet, submitSheet, logAudit } = useApp();

  const [editGoal, setEditGoal] = useState<(Omit<Goal, 'id' | 'sheetId' | 'actuals' | 'createdAt'> & { id?: string }) | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingWeightGoalId, setEditingWeightGoalId] = useState<string | null>(null);
  const [tempWeight, setTempWeight] = useState<number>(10);

  const existing = currentUser && activeCycle ? getSheet(currentUser.id, activeCycle.id) : undefined;

  const [sheet, setSheet] = useState<GoalSheet>(() => {
    const u = currentUser;
    const c = activeCycle;
    return existing ?? {
      id: sheetId(), employeeId: u?.id ?? '', cycleId: c?.id ?? '', status: 'draft', goals: [],
    };
  });

  if (!currentUser || !activeCycle) return (
    <div className="page-body">
      <div className="empty-state">
        <div className="empty-icon"><Target size={40} strokeWidth={1} /></div>
        <div className="empty-title">No Active Cycle</div>
        <div className="empty-desc">Please wait for the admin to configure a cycle.</div>
      </div>
    </div>
  );

  const openAdd = () => {
    if (sheet.goals.length >= 8) { setSubmitError('Maximum 8 goals allowed.'); return; }
    setEditGoal(EMPTY_GOAL()); setEditIdx(null); setErrors({}); setShowModal(true);
  };
  const openEdit = (idx: number) => {
    const g = sheet.goals[idx];
    setEditGoal({ thrustArea: g.thrustArea, title: g.title, description: g.description, uom: g.uom, target: g.target, weightage: g.weightage, isShared: g.isShared, id: g.id });
    setEditIdx(idx); setErrors({}); setShowModal(true);
  };
  const removeGoal = (idx: number) => {
    const updated = sheet.goals.filter((_, i) => i !== idx);
    const updatedSheet = { ...sheet, goals: updated };
    setSheet(updatedSheet); saveSheet(updatedSheet);
  };
  const validateGoal = (g: typeof editGoal) => {
    const e: Record<string, string> = {};
    if (!g) return e;
    if (!g.thrustArea) e.thrustArea = 'Select a thrust area';
    if (!g.title.trim()) e.title = 'Goal title is required';
    if (!g.description.trim()) e.description = 'Description is required';
    if (!g.target || (g.uom !== 'timeline' && Number(g.target) <= 0)) e.target = 'Valid target required';
    if (g.weightage < 10) e.weightage = 'Minimum 10% weightage';
    if (g.weightage > 100) e.weightage = 'Maximum 100% weightage';
    return e;
  };
  const saveGoal = () => {
    if (!editGoal) return;
    const e = validateGoal(editGoal);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const nowIso = new Date().toISOString();
    const goal: Goal = {
      id: editGoal.id ?? genId(), sheetId: sheet.id,
      thrustArea: editGoal.thrustArea, title: editGoal.title, description: editGoal.description,
      uom: editGoal.uom as UoMType, target: editGoal.target, weightage: editGoal.weightage,
      isShared: editGoal.isShared,
      actuals: editIdx !== null ? sheet.goals[editIdx].actuals : [],
      createdAt: editIdx !== null ? sheet.goals[editIdx].createdAt : nowIso,
    };
    const goals = editIdx !== null ? sheet.goals.map((g, i) => (i === editIdx ? goal : g)) : [...sheet.goals, goal];
    const updatedSheet = { ...sheet, goals };
    setSheet(updatedSheet); saveSheet(updatedSheet);
    setShowModal(false); setSubmitError('');
  };
  const handleSubmit = () => {
    setSubmitError('');
    if (sheet.goals.length === 0) { setSubmitError('Add at least one goal before submitting.'); return; }
    if (totalW !== 100) { setSubmitError(`Total weightage must be exactly 100%. Current: ${totalW}%.`); return; }
    if (sheet.goals.some(g => g.weightage < 10)) { setSubmitError('Each goal must have at least 10% weightage.'); return; }
    submitSheet(sheet.id);
    logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'GOAL_SUBMITTED', entityType: 'GoalSheet', entityId: sheet.id, after: 'Submitted for approval' });
    setSheet(prev => ({ ...prev, status: 'submitted' }));
    setSuccess('Goal sheet submitted successfully!');
  };

  const isLocked = existing?.status === 'approved';
  const isSubmitted = existing?.status === 'submitted';
  const totalW = sheet.goals.reduce((s, g) => s + g.weightage, 0);
  const canEdit = !isLocked && !isSubmitted;
  const canEditSharedWeight = !isLocked && !isSubmitted;
  const weightStatus = totalW === 100 ? 'ok' : totalW > 100 ? 'error' : 'warn';

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">My Goal Sheet</div>
          <div className="section-sub">{activeCycle.name} · {currentUser.department}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canEdit && <button className="btn btn-primary" onClick={openAdd} disabled={sheet.goals.length >= 8}><Plus size={15} /> Add Goal</button>}
          {canEdit && sheet.goals.length > 0 && (
            <button className="btn btn-success" onClick={handleSubmit} disabled={totalW !== 100}><Send size={14} /> Submit for Approval</button>
          )}
        </div>
      </div>

      {success && <div className="alert alert-success"><CheckCircle size={15} /> {success}</div>}
      {submitError && <div className="alert alert-danger"><AlertTriangle size={15} /> {submitError}</div>}
      {isLocked && <div className="alert alert-info"><Lock size={14} /> Your goal sheet is approved and locked. Contact Admin for any changes.</div>}
      {isSubmitted && <div className="alert alert-warning"><Info size={14} /> Submitted and pending manager approval. No edits allowed.</div>}
      {existing?.status === 'returned' && (
        <div className="alert alert-danger"><RotateCcw size={14} /> Returned by manager: <em>"{existing.managerComment}"</em>. Please revise and resubmit.</div>
      )}

      {/* Weightage Indicator */}
      {sheet.goals.length > 0 && (
        <div className={`weightage-indicator ${weightStatus}`} style={{ marginBottom: 20 }}>
          <Scale size={15} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>{totalW}% / 100%</span>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className={`progress-fill ${weightStatus === 'ok' ? 'green' : weightStatus === 'warn' ? 'yellow' : 'red'}`}
              style={{ width: `${Math.min(100, totalW)}%` }} />
          </div>
          <span style={{ fontSize: 12.5 }}>
            {totalW === 100 ? 'Weightage balanced' : totalW < 100 ? `${100 - totalW}% remaining` : `Over by ${totalW - 100}%`}
          </span>
        </div>
      )}

      {/* Goal Cards */}
      {sheet.goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Target size={44} strokeWidth={1} /></div>
          <div className="empty-title">No Goals Yet</div>
          <div className="empty-desc">Add your first goal to start building your goal sheet for {activeCycle.name}.</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}><Plus size={15} /> Add First Goal</button>
        </div>
      ) : (
        sheet.goals.map((goal, idx) => (
          <div key={goal.id} className={`goal-card${goal.isShared ? ' shared' : ''}`}>
            <div className="goal-card-header">
              <div>
                <div className="goal-thrust">{goal.thrustArea} {goal.isShared && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Link2 size={10} /> Shared</span>}</div>
                <div className="goal-title">{goal.title}</div>
                <div className="goal-desc">{goal.description}</div>
              </div>
              {canEdit && !goal.isShared && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(idx)}><Edit2 size={13} /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeGoal(idx)}><Trash2 size={13} /></button>
                </div>
              )}
            </div>
            <div className="goal-meta">
              <span className="goal-meta-item"><Scale size={12} /> {goal.weightage}%</span>
              <span className="goal-meta-item"><Ruler size={12} /> {UOM_LABELS[goal.uom]}</span>
              <span className="goal-meta-item"><Target size={12} /> Target: {goal.uom === 'timeline' ? goal.target : `${goal.target}${goal.uom.includes('percent') ? '%' : ''}`}</span>
              {goal.isShared && canEditSharedWeight && (
                editingWeightGoalId === goal.id ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                    <input type="number" min={10} max={100} value={tempWeight}
                      onChange={e => setTempWeight(Number(e.target.value))}
                      style={{ width: 60, padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontSize: 13 }} />
                    <span style={{ fontSize: 13 }}>%</span>
                    <button className="btn btn-success btn-sm" onClick={() => {
                      const updated = { ...sheet, goals: sheet.goals.map(g => g.id === goal.id ? { ...g, weightage: tempWeight } : g) };
                      setSheet(updated); saveSheet(updated); setEditingWeightGoalId(null);
                    }}><Save size={12} /></button>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setEditingWeightGoalId(null)}><X size={12} /></button>
                  </span>
                ) : (
                  <button className="btn btn-secondary btn-sm" style={{ padding: '2px 10px', fontSize: 12, marginLeft: 4 }}
                    onClick={() => { setTempWeight(goal.weightage); setEditingWeightGoalId(goal.id); }}>
                    <Scale size={11} /> Edit Weight
                  </button>
                )
              )}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Goal Modal */}
      {showModal && editGoal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editIdx !== null ? 'Edit Goal' : 'Add New Goal'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Thrust Area *</label>
                <select className="form-select" value={editGoal.thrustArea} onChange={e => setEditGoal({ ...editGoal, thrustArea: e.target.value })}>
                  <option value="">Select Thrust Area</option>
                  {THRUST_AREAS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.thrustArea && <div className="form-error">{errors.thrustArea}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Goal Title *</label>
                <input className="form-input" value={editGoal.title} onChange={e => setEditGoal({ ...editGoal, title: e.target.value })} placeholder="e.g. Achieve Sales Revenue Target" />
                {errors.title && <div className="form-error">{errors.title}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={editGoal.description} onChange={e => setEditGoal({ ...editGoal, description: e.target.value })} placeholder="Describe the goal and how it will be measured" />
                {errors.description && <div className="form-error">{errors.description}</div>}
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Unit of Measurement *</label>
                  <select className="form-select" value={editGoal.uom} onChange={e => setEditGoal({ ...editGoal, uom: e.target.value as UoMType })}>
                    {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target *</label>
                  {editGoal.uom === 'timeline'
                    ? <input className="form-input" type="date" value={editGoal.target as string} onChange={e => setEditGoal({ ...editGoal, target: e.target.value })} />
                    : <input className="form-input" type="number" value={editGoal.target as number} onChange={e => setEditGoal({ ...editGoal, target: Number(e.target.value) })} placeholder="100" />
                  }
                  {errors.target && <div className="form-error">{errors.target}</div>}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Weightage (%) * <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>Min 10% — Total must equal 100%</span></label>
                <input className="form-input" type="number" min={10} max={100} value={editGoal.weightage}
                  onChange={e => setEditGoal({ ...editGoal, weightage: Number(e.target.value) })} placeholder="10" />
                {errors.weightage && <div className="form-error">{errors.weightage}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveGoal}><Save size={14} /> Save Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
