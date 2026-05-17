import React from 'react';
import { useApp } from '../../context/AppContext';
import { computeWeightedScore } from '../../data/seed';
import { Quarter } from '../../types';
import { Target, Scale, MessageSquare, Calendar, AlertTriangle, CheckCircle, RotateCcw, BarChart3 } from 'lucide-react';

export default function EmployeeDashboard() {
  const { currentUser, goalSheets, activeCycle, checkIns } = useApp();
  if (!currentUser) return null;

  const sheet = goalSheets.find(s => s.employeeId === currentUser.id && s.cycleId === activeCycle?.id);
  const totalWeightage = sheet?.goals.reduce((s, g) => s + g.weightage, 0) ?? 0;
  const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const myCheckIns = checkIns.filter(c => c.employeeId === currentUser.id);

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Hello, {currentUser.name.split(' ')[0]}</div>
          <div className="section-sub">{activeCycle?.name} — {currentUser.designation}</div>
        </div>
        {sheet && (
          <span className={`badge badge-${sheet.status}`}>
            {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon purple"><Target size={20} /></div>
          <div><div className="stat-val">{sheet?.goals.length ?? 0}</div><div className="stat-label">Total Goals</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Scale size={20} /></div>
          <div>
            <div className="stat-val" style={{ color: totalWeightage === 100 ? 'var(--success)' : 'var(--warning)' }}>{totalWeightage}%</div>
            <div className="stat-label">Total Weightage</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><MessageSquare size={20} /></div>
          <div><div className="stat-val">{myCheckIns.length}</div><div className="stat-label">Check-ins Received</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Calendar size={20} /></div>
          <div><div className="stat-val">{activeCycle?.year ?? '—'}</div><div className="stat-label">Active Cycle</div></div>
        </div>
      </div>

      {!sheet && (
        <div className="alert alert-warning">
          <AlertTriangle size={15} />
          You haven't created your goal sheet yet for {activeCycle?.name}. Navigate to <strong>My Goals</strong> to get started.
        </div>
      )}
      {sheet?.status === 'returned' && (
        <div className="alert alert-danger">
          <RotateCcw size={15} />
          Your goal sheet was returned by your manager. Comment: <em>"{sheet.managerComment}"</em>. Please revise and resubmit.
        </div>
      )}
      {sheet?.status === 'approved' && (
        <div className="alert alert-success">
          <CheckCircle size={15} />
          Your goal sheet is approved and locked. Update your quarterly actuals in the <strong>Check-ins</strong> tab.
        </div>
      )}

      {/* Quarterly Progress */}
      {sheet && sheet.status === 'approved' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            <BarChart3 size={16} color="var(--accent-light)" /> Quarterly Weighted Score
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {quarters.map(q => {
              const score = computeWeightedScore(sheet.goals, q);
              const hasData = sheet.goals.some(g => g.actuals.find(a => a.quarter === q));
              return (
                <div key={q} style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{q}</div>
                  {hasData ? (
                    <>
                      <div style={{ fontSize: 28, fontWeight: 800, color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                        {score.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weighted Score</div>
                      <div className="progress-bar" style={{ marginTop: 10 }}>
                        <div className={`progress-fill ${score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}`} style={{ width: `${Math.min(100, score)}%` }} />
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Check-in Comments */}
      {myCheckIns.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            <MessageSquare size={16} color="var(--accent-light)" /> Recent Manager Feedback
          </div>
          {myCheckIns.slice(-3).reverse().map(ci => (
            <div key={ci.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="badge badge-on_track">{ci.quarter}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(ci.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{ci.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
