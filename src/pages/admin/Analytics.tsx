import React from 'react';
import { useApp } from '../../context/AppContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { computeWeightedScore } from '../../data/seed';
import { Quarter } from '../../types';
import { TrendingUp } from 'lucide-react';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

type TooltipPayloadItem = { color: string; name: string; value: number | string };
type CustomTooltipProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string };

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i: number) => (
        <div key={i} style={{ color: p.color, fontSize: 13 }}>{p.name}: {p.value}{typeof p.value === 'number' && p.value <= 100 ? '%' : ''}</div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { users, goalSheets, checkIns, activeCycle } = useApp();

  const employees = users.filter(u => u.role === 'employee');
  const approvedSheets = goalSheets.filter(s => s.cycleId === activeCycle?.id && s.status === 'approved');

  const qoqData = QUARTERS.map(q => {
    const entry: Record<string, number | string | null> = { quarter: q };
    employees.forEach(emp => {
      const sheet = approvedSheets.find(s => s.employeeId === emp.id);
      if (sheet) entry[emp.name.split(' ')[0]] = computeWeightedScore(sheet.goals, q) || null;
    });
    return entry;
  });

  const depts = [...new Set(employees.map(e => e.department))];
  const deptData = depts.map(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const approved = deptEmps.filter(e => goalSheets.find(s => s.employeeId === e.id && s.cycleId === activeCycle?.id && s.status === 'approved')).length;
    return { dept, total: deptEmps.length, approved, rate: deptEmps.length > 0 ? Math.round((approved / deptEmps.length) * 100) : 0 };
  });

  const thrustMap: Record<string, number> = {};
  goalSheets.forEach(s => s.goals.forEach(g => { thrustMap[g.thrustArea] = (thrustMap[g.thrustArea] || 0) + 1; }));
  const thrustData = Object.entries(thrustMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const uomMap: Record<string, number> = {};
  goalSheets.forEach(s => s.goals.forEach(g => { uomMap[g.uom] = (uomMap[g.uom] || 0) + 1; }));
  const uomData = Object.entries(uomMap).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  const mgrs = users.filter(u => u.role === 'manager');
  const mgrEffData = mgrs.map(mgr => {
    const team = users.filter(u => u.managerId === mgr.id);
    const checkinsDone = team.filter(emp => checkIns.some(c => c.employeeId === emp.id && c.managerId === mgr.id)).length;
    const approvalRate = team.length > 0 ? Math.round((goalSheets.filter(s => team.map(t => t.id).includes(s.employeeId) && s.status === 'approved').length / team.length) * 100) : 0;
    return { name: mgr.name.split(' ')[0], checkins: checkinsDone, approvals: approvalRate, team: team.length };
  });

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Analytics</div>
          <div className="section-sub">Quarter-on-quarter trends, heatmaps, and goal insights</div>
        </div>
        <span className="badge badge-approved">Bonus Feature</span>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
          <TrendingUp size={15} color="var(--accent-light)" /> Quarter-on-Quarter Score Trend
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={qoqData}>
            <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            {employees.map((emp, i) => (
              <Line key={emp.id} type="monotone" dataKey={emp.name.split(' ')[0]} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 5, fill: COLORS[i % COLORS.length] }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Department Completion Rate</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" fill="#6366f1" radius={[0, 4, 4, 0]}>
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Goals by Thrust Area</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={thrustData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                label={({ name, percent }: { name?: string; percent?: number }) => `${(name ?? '').split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false} fontSize={11}>
                {thrustData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Goals by UoM Type</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={uomData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {uomData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Manager Effectiveness</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Manager</th><th>Team Size</th><th>Check-ins</th><th>Approval Rate</th></tr>
              </thead>
              <tbody>
                {mgrEffData.map(m => (
                  <tr key={m.name}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.team}</td>
                    <td>{m.checkins}/{m.team}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill green" style={{ width: `${m.approvals}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{m.approvals}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
