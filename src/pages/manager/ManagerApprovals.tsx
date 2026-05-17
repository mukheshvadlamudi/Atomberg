import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal, GoalSheet } from '../../types';
import { UOM_LABELS } from '../../data/seed';
import { CheckSquare, RotateCcw, Edit2, Save, X, Scale, Ruler, CheckCircle } from 'lucide-react';

export default function ManagerApprovals() {
  const { currentUser, users, goalSheets, saveSheet, approveSheet, returnSheet, logAudit } = useApp();

  const [selected, setSelected] = useState<GoalSheet | null>(null);
  const [returnComment, setReturnComment] = useState('');
  const [showReturn, setShowReturn] = useState(false);
  const [editingGoal, setEditingGoal] = useState<{ idx: number; target: number | string; weightage: number } | null>(null);
  const [toast, setToast] = useState('');

  if (!currentUser) return null;

  const teamIds = users.filter(u => u.managerId === currentUser.id).map(u => u.id);
  const pending = goalSheets.filter(s => teamIds.includes(s.employeeId) && s.status === 'submitted');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const employee = (id: string) => users.find(u => u.id === id);

  const handleInlineEdit = (idx: number, goal: Goal) => setEditingGoal({ idx, target: goal.target, weightage: goal.weightage });

  const saveInline = () => {
    if (!selected || !editingGoal) return;
    const goals = selected.goals.map((g, i) => i === editingGoal.idx ? { ...g, target: editingGoal.target, weightage: editingGoal.weightage } : g);
    const updated = { ...selected, goals };
    setSelected(updated); saveSheet(updated);
    logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'GOAL_EDITED_BY_MANAGER', entityType: 'Goal', entityId: selected.goals[editingGoal.idx].id, before: JSON.stringify({ target: selected.goals[editingGoal.idx].target, weightage: selected.goals[editingGoal.idx].weightage }), after: JSON.stringify({ target: editingGoal.target, weightage: editingGoal.weightage }) });
    setEditingGoal(null);
    showToast('Goal updated successfully');
  };

  const handleApprove = (sheet: GoalSheet) => {
    approveSheet(sheet.id, currentUser.id);
    setSelected(null);
    showToast('Goal sheet approved and locked');
  };

  const handleReturn = () => {
    if (!selected || !returnComment.trim()) return;
    returnSheet(selected.id, currentUser.id, returnComment);
    setSelected(null); setShowReturn(false); setReturnComment('');
    showToast('Goal sheet returned for revision');
  };

  const totalW = (sheet: GoalSheet) => sheet.goals.reduce((s, g) => s + g.weightage, 0);

  return (
    <div className="page-body">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, background: '#1e293b', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontSize: 13.5, fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
          {toast}
        </div>
      )}

      <div className="section-header">
        <div>
          <div className="section-title">Goal Approvals</div>
          <div className="section-sub">{pending.length} sheet(s) awaiting review</div>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><CheckCircle size={44} strokeWidth={1} /></div>
          <div className="empty-title">All Clear</div>
          <div className="empty-desc">No goal sheets are pending your approval.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {pending.map(sheet => {
            const emp = employee(sheet.employeeId);
            const tw = totalW(sheet);
            return (
              <div key={sheet.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(sheet)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                      {emp?.name.split(' ').map(n => n[0]).join('').toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{emp?.name}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{emp?.designation} · {emp?.department}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Submitted: {sheet.submittedAt ? new Date(sheet.submittedAt).toLocaleDateString() : '—'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{sheet.goals.length} goals</div>
                    <div style={{ fontSize: 12, color: tw === 100 ? 'var(--success)' : 'var(--warning)', marginTop: 2 }}><Scale size={11} style={{ display: 'inline' }} /> {tw}% weightage</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Review</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setEditingGoal(null); } }}>
          <div className="modal" style={{ maxWidth: 780 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Review: {employee(selected.employeeId)?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>You can edit targets and weightages inline before approving</div>
              </div>
              <button className="modal-close" onClick={() => { setSelected(null); setEditingGoal(null); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className={`weightage-indicator ${totalW(selected) === 100 ? 'ok' : 'error'}`} style={{ marginBottom: 16 }}>
                <Scale size={14} />
                <span style={{ fontWeight: 700 }}>Total Weightage: {totalW(selected)}%</span>
                <span>{totalW(selected) === 100 ? 'Valid' : 'Must be 100%'}</span>
              </div>

              {selected.goals.map((goal, idx) => (
                <div key={goal.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{goal.thrustArea}</div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, margin: '4px 0' }}>{goal.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{goal.description}</div>
                      <div className="goal-meta" style={{ marginTop: 8 }}>
                        <span className="goal-meta-item"><Ruler size={11} /> {UOM_LABELS[goal.uom]}</span>
                      </div>
                    </div>

                    {editingGoal?.idx === idx ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginLeft: 16 }}>
                        <div>
                          <label className="form-label">Target</label>
                          {goal.uom === 'timeline'
                            ? <input className="form-input" type="date" style={{ width: 140 }} value={editingGoal.target as string} onChange={e => setEditingGoal({ ...editingGoal, target: e.target.value })} />
                            : <input className="form-input" type="number" style={{ width: 100 }} value={editingGoal.target as number} onChange={e => setEditingGoal({ ...editingGoal, target: Number(e.target.value) })} />
                          }
                        </div>
                        <div>
                          <label className="form-label">Weight %</label>
                          <input className="form-input" type="number" style={{ width: 80 }} min={10} max={100} value={editingGoal.weightage} onChange={e => setEditingGoal({ ...editingGoal, weightage: Number(e.target.value) })} />
                        </div>
                        <button className="btn btn-success btn-sm btn-icon" onClick={saveInline}><Save size={13} /></button>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setEditingGoal(null)}><X size={13} /></button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right', marginLeft: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Target: {goal.target}{goal.uom.includes('percent') ? '%' : ''}</div>
                        <div style={{ fontSize: 13, color: 'var(--accent-light)', fontWeight: 600 }}><Scale size={11} style={{ display: 'inline' }} /> {goal.weightage}%</div>
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => handleInlineEdit(idx, goal)}><Edit2 size={12} /> Edit</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => setShowReturn(true)}><RotateCcw size={14} /> Return for Rework</button>
              <button className="btn btn-success" onClick={() => handleApprove(selected)} disabled={totalW(selected) !== 100}>
                <CheckSquare size={14} /> Approve & Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowReturn(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title"><RotateCcw size={16} style={{ display: 'inline', marginRight: 8 }} />Return for Rework</div>
              <button className="modal-close" onClick={() => setShowReturn(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason / Comment *</label>
                <textarea className="form-textarea" rows={4} value={returnComment} onChange={e => setReturnComment(e.target.value)} placeholder="Explain what needs to be revised..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReturn(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReturn} disabled={!returnComment.trim()}><RotateCcw size={14} /> Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
