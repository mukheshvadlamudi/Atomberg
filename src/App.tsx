import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';

// Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import GoalSheet from './pages/employee/GoalSheet';
import EmployeeCheckIns from './pages/employee/EmployeeCheckIns';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerApprovals from './pages/manager/ManagerApprovals';
import ManagerCheckIns from './pages/manager/ManagerCheckIns';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersOrg from './pages/admin/UsersOrg';
import CycleConfig from './pages/admin/CycleConfig';
import Reports from './pages/admin/Reports';
import Analytics from './pages/admin/Analytics';
import AuditTrail from './pages/admin/AuditTrail';
import Escalations from './pages/admin/Escalations';
import SharedGoals from './pages/admin/SharedGoals';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRole && currentUser.role !== requiredRole) return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to={`/${currentUser.role}/dashboard`} replace /> : <LoginPage />} />

      {/* Employee */}
      <Route path="/employee/*" element={<ProtectedRoute requiredRole="employee"><AppLayout><Routes>
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="goals" element={<GoalSheet />} />
        <Route path="checkins" element={<EmployeeCheckIns />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes></AppLayout></ProtectedRoute>} />

      {/* Manager */}
      <Route path="/manager/*" element={<ProtectedRoute requiredRole="manager"><AppLayout><Routes>
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="approvals" element={<ManagerApprovals />} />
        <Route path="checkins" element={<ManagerCheckIns />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes></AppLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AppLayout><Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersOrg />} />
        <Route path="cycles" element={<CycleConfig />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="audit" element={<AuditTrail />} />
        <Route path="escalations" element={<Escalations />} />
        <Route path="shared-goals" element={<SharedGoals />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes></AppLayout></ProtectedRoute>} />

      <Route path="*" element={
        currentUser
          ? <Navigate to={`/${currentUser.role}/dashboard`} replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}
