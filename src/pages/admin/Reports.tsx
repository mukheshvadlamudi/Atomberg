import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UOM_LABELS } from '../../data/seed';
import * as XLSX from 'xlsx';
import { Quarter } from '../../types';
import { Download, Send, CheckCircle, ClipboardList, Briefcase } from 'lucide-react';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function Reports() {
  const { users, goalSheets, activeCycle } = useApp();
  const [filterDept, setFilterDept] = useState('');
  const [filterQ, setFilterQ] = useState<Quarter | 'all'>('all');

  const employees = users.filter(u => u.role === 'employee');
  const depts = [...new Set(employees.map(e => e.department))];
  const filtered = employees.filter(e => !filterDept || e.department === filterDept);

  const exportExcel = () => {
    type ReportRow = Record<string, string | number>;
    const rows: ReportRow[] = [];
    filtered.forEach(emp => {
      const sheet = goalSheets.find(s => s.employeeId === emp.id && s.cycleId === activeCycle?.id);
      if (!sheet) {
        rows.push({ Employee: emp.name, Department: emp.department, Designation: emp.designation, 'Goal Sheet Status': 'No Sheet', Goal: '—', 'Thrust Area': '—', UoM: '—', Weightage: '—', Target: '—' });
        return;
      }
      sheet.goals.forEach(goal => {
        const row: Record<string, string | number> = { Employee: emp.name, Department: emp.department, Designation: emp.designation, 'Goal Sheet Status': sheet.status, Goal: goal.title, 'Thrust Area': goal.thrustArea, UoM: UOM_LABELS[goal.uom], Weightage: `${goal.weightage}%`, Target: goal.target };
        QUARTERS.forEach(q => {
          const actual = goal.actuals.find(a => a.quarter === q);
          row[`${q} Actual`] = actual?.actual ?? '—';
          row[`${q} Score`] = actual?.score !== undefined ? `${actual.score.toFixed(1)}%` : '—';
        });
        rows.push(row);
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Achievement Report');
    XLSX.writeFile(wb, `AtomQuest_Achievement_Report_${activeCycle?.name ?? 'FY'}.xlsx`);
  };

  const completionStats = {
    goalSetting: goalSheets.filter(s => s.cycleId === activeCycle?.id && (s.status === 'submitted' || s.status === 'approved')).length,
    approved: goalSheets.filter(s => s.cycleId === activeCycle?.id && s.status === 'approved').length,
    total: employees.length,
  };

  const managerCompletionRates = users.filter(u => u.role === 'manager').map(mgr => {
    const team = users.filter(u => u.managerId === mgr.id);
    const done = team.filter(emp => goalSheets.find(s => s.employeeId === emp.id && s.cycleId === activeCycle?.id)?.status === 'approved').length;
    return { manager: mgr, total: team.length, done };
  });

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Reports &amp; Governance</div>
          <div className="section-sub">Achievement reports, completion dashboard, and exports</div>
        </div>
        <button className="btn btn-success" onClick={exportExcel}><Download size={14} /> Export Excel</button>
      </div>

      {/* Completion Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><Send size={20} /></div>
          <div><div className="stat-val">{completionStats.goalSetting}/{completionStats.total}</div><div className="stat-label">Goal Sheets Submitted</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle size={20} /></div>
          <div><div className="stat-val">{completionStats.approved}/{completionStats.total}</div><div className="stat-label">Approved Goal Sheets</div></div>
        </div>
        {QUARTERS.map(q => {
          const cnt = goalSheets.filter(s => s.cycleId === activeCycle?.id && s.status === 'approved' && s.goals.some(g => g.actuals.find(a => a.quarter === q))).length;
          return (
            <div key={q} className="stat-card">
              <div className="stat-icon yellow"><ClipboardList size={20} /></div>
              <div><div className="stat-val">{cnt}/{completionStats.approved}</div><div className="stat-label">{q} Check-ins Done</div></div>
            </div>
          );
        })}
      </div>

      {/* Manager Approval Rates */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          <Briefcase size={15} color="var(--accent-light)" /> Manager Approval Completion
        </div>
        {managerCompletionRates.map(({ manager, total, done }) => (
          <div key={manager.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{manager.name}</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{done}/{total}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill green" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Achievement Report</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="form-select" style={{ width: 160 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={filterQ} onChange={e => setFilterQ(e.target.value as Quarter | 'all')}>
              <option value="all">All Quarters</option>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Dept</th><th>Goal</th><th>UoM</th><th>Wt%</th><th>Target</th>
                {filterQ === 'all' ? QUARTERS.map(q => <React.Fragment key={q}><th>{q} Actual</th><th>{q} Score</th></React.Fragment>) : <><th>Actual</th><th>Score</th></>}
              </tr>
            </thead>
            <tbody>
              {filtered.flatMap(emp => {
                const sheet = goalSheets.find(s => s.employeeId === emp.id && s.cycleId === activeCycle?.id);
                if (!sheet) return [<tr key={emp.id}><td colSpan={10} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{emp.name} — No goal sheet</td></tr>];
                return sheet.goals.map((goal, gi) => (
                  <tr key={goal.id}>
                    {gi === 0 && <td rowSpan={sheet.goals.length}><div style={{ fontWeight: 600 }}>{emp.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{emp.designation}</div></td>}
                    {gi === 0 && <td rowSpan={sheet.goals.length}>{emp.department}</td>}
                    <td style={{ fontSize: 13 }}>{goal.title}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{UOM_LABELS[goal.uom].split('(')[0].trim()}</td>
                    <td><span className="chip">{goal.weightage}%</span></td>
                    <td style={{ fontWeight: 600 }}>{goal.target}</td>
                    {filterQ === 'all'
                      ? QUARTERS.flatMap(q => {
                          const a = goal.actuals.find(act => act.quarter === q);
                          return [
                            <td key={`${q}-a`} style={{ fontWeight: 600 }}>{a?.actual ?? '—'}</td>,
                            <td key={`${q}-s`} style={{ color: a?.score !== undefined ? (a.score >= 80 ? 'var(--success)' : a.score >= 60 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', fontWeight: 600 }}>{a?.score !== undefined ? `${a.score.toFixed(1)}%` : '—'}</td>,
                          ];
                        })
                      : (() => {
                          const a = goal.actuals.find(act => act.quarter === filterQ);
                          return [
                            <td key="a" style={{ fontWeight: 600 }}>{a?.actual ?? '—'}</td>,
                            <td key="s" style={{ color: a?.score !== undefined ? (a.score >= 80 ? 'var(--success)' : a.score >= 60 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)', fontWeight: 600 }}>{a?.score !== undefined ? `${a.score.toFixed(1)}%` : '—'}</td>,
                          ];
                        })()
                    }
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
