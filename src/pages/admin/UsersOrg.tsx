import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User as UserIcon, Shield, Briefcase, Plus, Edit2, Trash2, X, Save, Unlock } from 'lucide-react';
import { User, UserRole } from '../../types';

export default function UsersOrg() {
  const { users, goalSheets, activeCycle, saveUser, deleteUser, unlockSheet } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const filtered = users.filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!filterRole || u.role === filterRole)
  );

  const getManager = (id?: string) => users.find(u => u.id === id);
  const getSheet = (empId: string) => goalSheets.find(s => s.employeeId === empId && s.cycleId === activeCycle?.id);
  const getSheetStatus = (empId: string) => getSheet(empId)?.status;
  const depts = [...new Set(users.map(u => u.department))];

  const roleIcons: Record<string, React.ReactNode> = {
    employee: <UserIcon size={16} />,
    manager:  <Briefcase size={16} />,
    admin:    <Shield size={16} />,
  };

  const openAddModal = () => {
    setEditingUser({ role: 'employee', department: depts[0] || '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      deleteUser(userId);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.name || !editingUser?.email || !editingUser?.department || !editingUser?.designation) return;
    
    const newUser: User = {
      id: editingUser.id || `u-${Date.now()}`,
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role as UserRole || 'employee',
      department: editingUser.department,
      designation: editingUser.designation,
      managerId: editingUser.managerId
    };

    saveUser(newUser);
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="page-body">
      <div className="section-header">
        <div>
          <div className="section-title">Users &amp; Org Hierarchy</div>
          <div className="section-sub">{users.length} users across {depts.length} departments</div>
        </div>
        <div className="section-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {(['employee', 'manager', 'admin'] as const).map(role => {
          const cnt = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="stat-card">
              <div className="stat-icon purple">{roleIcons[role]}</div>
              <div><div className="stat-val">{cnt}</div><div className="stat-label">{role.charAt(0).toUpperCase() + role.slice(1)}s</div></div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input className="form-input" style={{ flex: 1, maxWidth: 320 }} placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 160 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {depts.map(dept => {
        const deptUsers = filtered.filter(u => u.department === dept);
        if (deptUsers.length === 0) return null;
        return (
          <div key={dept} className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{dept}</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Reports To</th>
                    <th>Goal Status</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptUsers.map(u => {
                    const mgr = getManager(u.managerId);
                    const status = u.role === 'employee' ? getSheetStatus(u.id) : undefined;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                              {u.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-approved' : u.role === 'manager' ? 'badge-submitted' : 'badge-draft'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ fontSize: 13 }}>{u.designation}</td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{mgr?.name ?? '—'}</td>
                        <td>
                          {status
                            ? <span className={`badge badge-${status}`}>{status}</span>
                            : u.role === 'employee' ? <span className="badge badge-draft">No Sheet</span> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>N/A</span>
                          }
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            {u.role === 'employee' && getSheet(u.id) && getSheet(u.id)!.status !== 'draft' && (
                              <button className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--accent)' }} 
                                onClick={() => {
                                  if (confirm('Unlock this goal sheet and return it to draft status?')) {
                                    unlockSheet(getSheet(u.id)!.id);
                                  }
                                }} 
                                title="Unlock Sheet">
                                <Unlock size={14} />
                              </button>
                            )}
                            <button className="btn btn-secondary btn-sm" style={{ padding: '6px' }} onClick={() => openEditModal(u)} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button className="btn btn-secondary btn-sm" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDelete(u.id)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* User Modal */}
      {isModalOpen && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{editingUser.id ? 'Edit User' : 'Add New User'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input required className="form-input" value={editingUser.name || ''} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input required type="email" className="form-input" value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin / HR</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input required className="form-input" value={editingUser.department || ''} onChange={e => setEditingUser({ ...editingUser, department: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input required className="form-input" value={editingUser.designation || ''} onChange={e => setEditingUser({ ...editingUser, designation: e.target.value })} />
              </div>

              {editingUser.role === 'employee' && (
                <div className="form-group">
                  <label className="form-label">Reports To (Manager)</label>
                  <select className="form-select" value={editingUser.managerId || ''} onChange={e => setEditingUser({ ...editingUser, managerId: e.target.value })}>
                    <option value="">-- Select Manager --</option>
                    {users.filter(u => u.role === 'manager').map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: 24, padding: 0, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> {editingUser.id ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
