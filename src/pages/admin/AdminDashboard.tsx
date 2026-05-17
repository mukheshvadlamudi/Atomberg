import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Send, CheckCircle, Clock, AlertTriangle, Search, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { users, goalSheets, checkIns, activeCycle, auditLogs } = useApp();

  const employees = users.filter(u => u.role === 'employee');
  const sheets = goalSheets.filter(s => s.cycleId === activeCycle?.id);
  const submitted = sheets.filter(s => s.status === 'submitted').length;
  const approved = sheets.filter(s => s.status === 'approved').length;
  const total = employees.length;

  const submissionRate = total > 0 ? Math.round(((submitted + approved) / total) * 100) : 0;
  const approvalRate   = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Admin Dashboard</div>
          <div className="section-sub">{activeCycle?.name} — Organisation Overview</div>
        </div>
        <span className="badge badge-approved">{activeCycle?.name} Active</span>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon purple"><Users size={20} /></div><div><div className="stat-val">{users.length}</div><div className="stat-label">Total Users</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><Send size={20} /></div><div><div className="stat-val">{submitted + approved}</div><div className="stat-label">Sheets Submitted</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={20} /></div><div><div className="stat-val">{approved}</div><div className="stat-label">Sheets Approved</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow"><Clock size={20} /></div><div><div className="stat-val">{submitted}</div><div className="stat-label">Pending Approval</div></div></div>
        <div className="stat-card"><div className="stat-icon red"><AlertTriangle size={20} /></div><div><div className="stat-val">{total - submitted - approved}</div><div className="stat-label">Not Started</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><Search size={20} /></div><div><div className="stat-val">{auditLogs.length}</div><div className="stat-label">Audit Events</div></div></div>
      </div>

      {/* Rates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
            <Send size={14} color="var(--accent-light)" /> Goal Submission Rate
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: submissionRate >= 80 ? 'var(--success)' : submissionRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{submissionRate}%</div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className={`progress-fill ${submissionRate >= 80 ? 'green' : submissionRate >= 50 ? 'yellow' : 'red'}`} style={{ width: `${submissionRate}%` }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{submitted + approved} / {total} employees</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
            <CheckCircle size={14} color="var(--accent-light)" /> Goal Approval Rate
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: approvalRate >= 80 ? 'var(--success)' : approvalRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{approvalRate}%</div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className={`progress-fill ${approvalRate >= 80 ? 'green' : approvalRate >= 50 ? 'yellow' : 'red'}`} style={{ width: `${approvalRate}%` }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{approved} / {total} employees</div>
        </div>
      </div>

      {/* Check-in Activity */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          <BarChart3 size={16} color="var(--accent-light)" /> Check-in Activity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => {
            const cnt = checkIns.filter(c => c.quarter === q).length;
            return (
              <div key={q} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{q}</div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{cnt}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>check-ins</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          <Search size={16} color="var(--accent-light)" /> Recent Activity
        </div>
        {auditLogs.slice(0, 6).map(log => (
          <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13.5 }}>
              <strong>{log.userName}</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>{log.action.replace(/_/g, ' ').toLowerCase()}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
