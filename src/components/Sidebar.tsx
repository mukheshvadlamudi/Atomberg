import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Target, ClipboardList, Users, CheckSquare,
  MessageSquare, Settings, BarChart2, TrendingUp, Search,
  Bell, Link2, LogOut, Zap, Trash2
} from 'lucide-react';

interface NavItem { to: string; icon: React.ReactNode; label: string; badge?: number; }

const employeeNav: NavItem[] = [
  { to: '/employee/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/employee/goals',     icon: <Target size={16} />,          label: 'My Goals' },
  { to: '/employee/checkins',  icon: <ClipboardList size={16} />,   label: 'Check-ins' },
];

const managerNav: NavItem[] = [
  { to: '/manager/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/manager/approvals', icon: <CheckSquare size={16} />,     label: 'Approvals' },
  { to: '/manager/checkins',  icon: <MessageSquare size={16} />,   label: 'Check-ins' },
];

const adminNav: NavItem[] = [
  { to: '/admin/dashboard',    icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/admin/users',        icon: <Users size={16} />,           label: 'Users & Org' },
  { to: '/admin/cycles',       icon: <Settings size={16} />,        label: 'Cycle Config' },
  { to: '/admin/reports',      icon: <BarChart2 size={16} />,       label: 'Reports' },
  { to: '/admin/analytics',    icon: <TrendingUp size={16} />,      label: 'Analytics' },
  { to: '/admin/audit',        icon: <Search size={16} />,          label: 'Audit Trail' },
  { to: '/admin/escalations',  icon: <Bell size={16} />,            label: 'Escalations' },
  { to: '/admin/shared-goals', icon: <Link2 size={16} />,           label: 'Shared Goals' },
];

const roleColors: Record<string, string> = { employee: '#10b981', manager: '#f59e0b', admin: '#6366f1' };

export default function Sidebar() {
  const { currentUser, logout, goalSheets, notifications, markNotificationRead, clearNotifications } = useApp();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs]);

  if (!currentUser) return null;

  const nav = currentUser.role === 'employee' ? employeeNav :
              currentUser.role === 'manager'  ? managerNav  : adminNav;

  const pendingApprovals = currentUser.role === 'manager'
    ? goalSheets.filter(s => s.status === 'submitted').length : 0;

  const userNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><Zap size={18} color="white" /></div>
        <div>
          <div className="logo-text">AtomQuest Portal</div>
          <div className="logo-sub">Goal &amp; Performance</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">{currentUser.role === 'admin' ? 'Administration' : 'Navigation'}</div>
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.label === 'Approvals' && pendingApprovals > 0 && (
                <span className="nav-badge">{pendingApprovals}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        {/* Notification Bell */}
        <div style={{ position: 'relative', marginBottom: '16px' }} ref={notifRef}>
          <button 
            className="nav-item" 
            style={{ width: '100%', background: showNotifs ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', textAlign: 'left' }}
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <span className="nav-icon"><Bell size={16} /></span>
            Notifications
            {unreadCount > 0 && <span className="nav-badge" style={{ background: 'var(--danger)' }}>{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', bottom: '110%', left: '0', width: '280px',
              background: '#13131a', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-md)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden', zIndex: 1000, animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Notifications</span>
                {userNotifs.length > 0 && (
                  <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {userNotifs.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  userNotifs.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: n.isRead ? 'transparent' : 'rgba(139,92,246,0.08)',
                        display: 'flex', gap: '10px', alignItems: 'flex-start'
                      }}
                      onClick={() => !n.isRead && markNotificationRead(n.id)}
                    >
                      <div style={{ flex: 1, cursor: n.isRead ? 'default' : 'pointer' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: '4px' }}>{n.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>{new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                      </div>
                      {!n.isRead && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '4px' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-role" style={{ color: roleColors[currentUser.role] }}>
              {currentUser.role === 'admin' ? 'Admin / HR' : currentUser.role === 'manager' ? 'Manager (L1)' : 'Employee'}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
