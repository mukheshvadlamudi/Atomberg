import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';

const actionColor: Record<string, string> = {
  GOAL_SUBMITTED: 'var(--info)', GOAL_APPROVED: 'var(--success)',
  GOAL_RETURNED: 'var(--danger)', GOAL_EDITED_BY_MANAGER: 'var(--warning)',
  CHECKIN_SAVED: 'var(--accent-light)', SHARED_GOAL_PUSHED: '#8b5cf6', CYCLE_UPDATED: '#f59e0b',
};

export default function AuditTrail() {
  const { auditLogs } = useApp();

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Audit Trail</div>
          <div className="section-sub">Complete log of all goal changes and system events</div>
        </div>
        <span className="chip">{auditLogs.length} entries</span>
      </div>

      {auditLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Search size={40} strokeWidth={1} /></div>
          <div className="empty-title">No Audit Logs Yet</div>
          <div className="empty-desc">All system events will appear here.</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleDateString()}<br />
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{log.userName}</td>
                    <td>
                      <span style={{ color: actionColor[log.action] ?? 'var(--text-secondary)', fontWeight: 600, fontSize: 12.5 }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td><span className="chip">{log.entityType}</span></td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-secondary)', maxWidth: 300 }}>
                      {log.after || log.before || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
