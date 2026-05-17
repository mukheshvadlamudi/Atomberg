import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quarter, GoalStatus } from '../../types';
import { UOM_LABELS } from '../../data/seed';
import { Lock, Edit2, Save, X, CheckCircle, Target, Scale, MessageSquare } from 'lucide-react';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function EmployeeCheckIns() {
  const { currentUser, activeCycle, getSheet, updateActual, checkIns } = useApp();

  const [activeQ, setActiveQ] = useState<Quarter>('Q1');
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [actualVal, setActualVal] = useState<string>('');
  const [achieveDate, setAchieveDate] = useState('');
  const [status, setStatus] = useState<GoalStatus>('on_track');
  const [saved, setSaved] = useState(false);

  if (!currentUser || !activeCycle) return null;

  const sheet = getSheet(currentUser.id, activeCycle.id);
  const myCheckIns = checkIns.filter(c => c.employeeId === currentUser.id && c.quarter === activeQ);

  if (!sheet || sheet.status !== 'approved') {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="empty-icon"><Lock size={40} strokeWidth={1} /></div>
          <div className="empty-title">Goal Sheet Not Approved</div>
          <div className="empty-desc">You can log actuals only after your manager approves your goal sheet.</div>
        </div>
      </div>
    );
  }

  const openEdit = (goalId: string) => {
    const goal = sheet.goals.find(g => g.id === goalId)!;
    const existing = goal.actuals.find(a => a.quarter === activeQ);
    setActualVal(existing ? String(existing.actual) : '');
    setAchieveDate(existing?.achievementDate ?? '');
    setStatus(existing?.status ?? 'on_track');
    setEditGoalId(goalId); setSaved(false);
  };

  const saveActual = () => {
    if (!editGoalId) return;
    const goal = sheet.goals.find(g => g.id === editGoalId)!;
    const val = goal.uom === 'timeline' ? achieveDate : actualVal;
    if (!val) return;
    updateActual(sheet.id, editGoalId, activeQ, goal.uom === 'timeline' ? achieveDate : Number(actualVal), status, achieveDate || undefined);
    setSaved(true); setEditGoalId(null);
  };

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Quarterly Check-ins</div>
          <div className="section-sub">Log your actual achievements per goal for {activeCycle.name}</div>
        </div>
      </div>

      <div className="tabs">
        {QUARTERS.map(q => (
          <button key={q} className={`tab-btn${activeQ === q ? ' active' : ''}`} onClick={() => { setActiveQ(q); setEditGoalId(null); setSaved(false); }}>
            {q}
          </button>
        ))}
      </div>

      {saved && <div className="alert alert-success"><CheckCircle size={15} /> Achievement saved successfully!</div>}

      {myCheckIns.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '3px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            <MessageSquare size={14} color="var(--accent-light)" /> Manager Check-in Comment ({activeQ})
          </div>
          {myCheckIns.map(ci => (
            <p key={ci.id} style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{ci.comment}"</p>
          ))}
        </div>
      )}

      {sheet.goals.map(goal => {
        const actual = goal.actuals.find(a => a.quarter === activeQ);
        const isEditing = editGoalId === goal.id;
        const score = actual?.score;

        return (
          <div key={goal.id} className="goal-card" style={{ marginBottom: 12 }}>
            <div className="goal-card-header">
              <div style={{ flex: 1 }}>
                <div className="goal-thrust">{goal.thrustArea} · {UOM_LABELS[goal.uom]}</div>
                <div className="goal-title">{goal.title}</div>
                <div className="goal-meta" style={{ marginTop: 8 }}>
                  <span className="goal-meta-item"><Target size={11} /> Target: {goal.uom === 'timeline' ? goal.target : `${goal.target}${goal.uom.includes('percent') ? '%' : ''}`}</span>
                  <span className="goal-meta-item"><Scale size={11} /> {goal.weightage}%</span>
                  {actual && <span className={`badge badge-${actual.status}`}>{actual.status.replace('_', ' ')}</span>}
                </div>
              </div>
              {!isEditing && (
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(goal.id)}>
                  {actual ? <><Edit2 size={13} /> Update</> : '+ Log'}
                </button>
              )}
            </div>

            {actual && !isEditing && (
              <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Actual Achievement</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{actual.actual}{goal.uom.includes('percent') ? '%' : ''}</div>
                  </div>
                  {score !== undefined && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Progress Score</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                        {score.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
                {score !== undefined && (
                  <div className="progress-bar" style={{ marginTop: 10 }}>
                    <div className={`progress-fill ${score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}`} style={{ width: `${Math.min(100, score)}%` }} />
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <div style={{ marginTop: 14, padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="form-row">
                  {goal.uom === 'timeline' ? (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Completion Date</label>
                      <input className="form-input" type="date" value={achieveDate} onChange={e => setAchieveDate(e.target.value)} />
                    </div>
                  ) : (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Actual Achievement {goal.uom.includes('percent') ? '(%)' : ''}</label>
                      <input className="form-input" type="number" value={actualVal} onChange={e => setActualVal(e.target.value)} placeholder={`e.g. ${goal.target}`} />
                    </div>
                  )}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Status</label>
                    <select className="form-select" value={status} onChange={e => setStatus(e.target.value as GoalStatus)}>
                      <option value="not_started">Not Started</option>
                      <option value="on_track">On Track</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={saveActual}><Save size={13} /> Save</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditGoalId(null)}><X size={13} /> Cancel</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
