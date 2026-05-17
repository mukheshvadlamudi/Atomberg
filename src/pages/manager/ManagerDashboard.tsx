import React from 'react';
import { useApp } from '../../context/AppContext';
import { computeWeightedScore } from '../../data/seed';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export default function ManagerDashboard() {
  const { currentUser, getTeamSheets, checkIns } = useApp();
  if (!currentUser) return null;

  const team = getTeamSheets(currentUser.id);
  const pending = team.filter(t => t.sheet?.status === 'submitted').length;
  const approved = team.filter(t => t.sheet?.status === 'approved').length;
  const notStarted = team.filter(t => !t.sheet || t.sheet.status === 'draft').length;

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Manager Dashboard</div>
          <div className="section-sub">Team overview — {currentUser.department}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon purple"><Users size={20} /></div><div><div className="stat-val">{team.length}</div><div className="stat-label">Team Members</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow"><Clock size={20} /></div><div><div className="stat-val">{pending}</div><div className="stat-label">Pending Approval</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={20} /></div><div><div className="stat-val">{approved}</div><div className="stat-label">Approved</div></div></div>
        <div className="stat-card"><div className="stat-icon red"><AlertTriangle size={20} /></div><div><div className="stat-val">{notStarted}</div><div className="stat-label">Not Started</div></div></div>
      </div>

      {pending > 0 && (
        <div className="alert alert-warning">
          <Clock size={15} /> {pending} goal sheet(s) are awaiting your approval. Go to <strong>Approvals</strong> to review.
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          <Users size={16} color="var(--accent-light)" /> Team Goal Status
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Goals</th>
                <th>Status</th>
                {quarters.map(q => <th key={q}>{q} Score</th>)}
                <th>Check-ins</th>
              </tr>
            </thead>
            <tbody>
              {team.map(({ employee, sheet }) => {
                const empCheckIns = checkIns.filter(c => c.employeeId === employee.id);
                return (
                  <tr key={employee.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{employee.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{employee.designation}</div>
                    </td>
                    <td>{employee.department}</td>
                    <td>{sheet?.goals.length ?? 0}</td>
                    <td>
                      {sheet ? <span className={`badge badge-${sheet.status}`}>{sheet.status}</span>
                        : <span className="badge badge-draft">No Sheet</span>}
                    </td>
                    {quarters.map(q => {
                      const score = sheet?.status === 'approved' ? computeWeightedScore(sheet.goals, q) : null;
                      return (
                        <td key={q} style={{ fontWeight: 600, color: score === null ? 'var(--text-muted)' : score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                          {score !== null && score > 0 ? `${score.toFixed(1)}%` : '—'}
                        </td>
                      );
                    })}
                    <td>{empCheckIns.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
