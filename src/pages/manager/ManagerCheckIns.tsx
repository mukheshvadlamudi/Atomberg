import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quarter } from '../../types';
import { UOM_LABELS, computeWeightedScore } from '../../data/seed';
import { CheckIn } from '../../types';
import { Clock, Save, CheckCircle } from 'lucide-react';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function ManagerCheckIns() {
  const { currentUser, users, goalSheets, checkIns, saveCheckIn, logAudit } = useApp();

  const [activeQ, setActiveQ] = useState<Quarter>('Q1');
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  if (!currentUser) return null;

  const teamIds = users.filter(u => u.managerId === currentUser.id).map(u => u.id);
  const approvedSheets = goalSheets.filter(s => teamIds.includes(s.employeeId) && s.status === 'approved');

  const getEmployee = (id: string) => users.find(u => u.id === id);
  const getExistingComment = (sheetId: string) =>
    checkIns.find(c => c.goalSheetId === sheetId && c.quarter === activeQ && c.managerId === currentUser.id)?.comment ?? '';

  const handleSave = (sheet: typeof approvedSheets[0]) => {
    const comment = commentMap[sheet.id] ?? getExistingComment(sheet.id);
    if (!comment.trim()) return;
    // eslint-disable-next-line react-hooks/purity
    const ciId = `ci-${String(Date.now())}`;  // safe: called in event handler, not during render
    const ci: CheckIn = {
      id: ciId, managerId: currentUser.id,
      employeeId: sheet.employeeId, goalSheetId: sheet.id,
      quarter: activeQ, comment, createdAt: new Date().toISOString(),
    };
    saveCheckIn(ci);
    logAudit({ userId: currentUser.id, userName: currentUser.name, action: 'CHECKIN_SAVED', entityType: 'CheckIn', entityId: ci.id, after: `Q${activeQ} check-in for ${getEmployee(sheet.employeeId)?.name}` });
    setSaved(p => ({ ...p, [sheet.id]: true }));
    setTimeout(() => setSaved(p => ({ ...p, [sheet.id]: false })), 3000);
  };

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Team Check-ins</div>
          <div className="section-sub">Review planned vs actual and add structured feedback</div>
        </div>
      </div>

      <div className="tabs">
        {QUARTERS.map(q => (
          <button key={q} className={`tab-btn${activeQ === q ? ' active' : ''}`} onClick={() => { setActiveQ(q); setCommentMap({}); }}>
            {q}
          </button>
        ))}
      </div>

      {approvedSheets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Clock size={40} strokeWidth={1} /></div>
          <div className="empty-title">No Approved Sheets</div>
          <div className="empty-desc">Approve your team's goal sheets first to start check-ins.</div>
        </div>
      ) : (
        approvedSheets.map(sheet => {
          const emp = getEmployee(sheet.employeeId);
          const weightedScore = computeWeightedScore(sheet.goals, activeQ);
          const existingComment = getExistingComment(sheet.id);
          const comment = commentMap[sheet.id] ?? existingComment;

          return (
            <div key={sheet.id} className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                    {emp?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{emp?.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{emp?.designation}</div>
                  </div>
                </div>
                {weightedScore > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weighted Score ({activeQ})</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: weightedScore >= 80 ? 'var(--success)' : weightedScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                      {weightedScore.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="table-wrap" style={{ marginBottom: 20 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Goal</th>
                      <th>UoM</th>
                      <th>Weight</th>
                      <th>Target</th>
                      <th>Actual ({activeQ})</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.goals.map(goal => {
                      const actual = goal.actuals.find(a => a.quarter === activeQ);
                      const score = actual?.score;
                      return (
                        <tr key={goal.id}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{goal.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{goal.thrustArea}</div>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{UOM_LABELS[goal.uom].split('(')[0].trim()}</td>
                          <td><span className="chip">{goal.weightage}%</span></td>
                          <td style={{ fontWeight: 600 }}>{goal.target}{goal.uom.includes('percent') ? '%' : ''}</td>
                          <td style={{ fontWeight: 700, color: actual ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {actual ? `${actual.actual}${goal.uom.includes('percent') ? '%' : ''}` : '—'}
                          </td>
                          <td style={{ fontWeight: 700, color: score === undefined ? 'var(--text-muted)' : score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                            {score !== undefined ? `${score.toFixed(1)}%` : '—'}
                          </td>
                          <td>
                            {actual
                              ? <span className={`badge badge-${actual.status}`}>{actual.status.replace('_', ' ')}</span>
                              : <span className="badge badge-not_started">Not logged</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Check-in Comment ({activeQ}) {existingComment && '· Previously saved'}</label>
                <textarea className="form-textarea" rows={3}
                  value={comment}
                  onChange={e => setCommentMap(p => ({ ...p, [sheet.id]: e.target.value }))}
                  placeholder="Document the discussion, observations, and next steps for this quarter..."
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => handleSave(sheet)} disabled={!comment.trim()}>
                  <Save size={14} /> {existingComment ? 'Update' : 'Save'} Check-in
                </button>
                {saved[sheet.id] && <span style={{ color: 'var(--success)', fontSize: 13.5, alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={14} /> Saved!</span>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
