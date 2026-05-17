import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User, GoalSheet, CheckIn, AuditLog, Cycle, SharedGoalTemplate, EscalationRule, Goal, Quarter, AppNotification
} from '../types';
import {
  SEED_USERS, SEED_GOAL_SHEETS, SEED_CHECKINS, SEED_AUDIT_LOGS,
  SEED_CYCLE, SEED_ESCALATION_RULES, calculateScore
} from '../data/seed';
import { sendEmailNotification } from '../services/emailService';
import { sendTeamsNotification } from '../services/teamsService';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AppState {
  users: User[];
  currentUser: User | null;
  goalSheets: GoalSheet[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  cycles: Cycle[];
  sharedGoalTemplates: SharedGoalTemplate[];
  escalationRules: EscalationRule[];
  notifications: AppNotification[];
}

// ─── Context API ──────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  getSheet: (employeeId: string, cycleId: string) => GoalSheet | undefined;
  saveSheet: (sheet: GoalSheet) => void;
  submitSheet: (sheetId: string) => void;
  approveSheet: (sheetId: string, managerId: string) => void;
  returnSheet: (sheetId: string, managerId: string, comment: string) => void;
  saveCheckIn: (checkIn: CheckIn) => void;
  logAudit: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  updateActual: (sheetId: string, goalId: string, quarter: Quarter, actual: number | string, status: import('../types').GoalStatus, achievementDate?: string) => void;
  saveCycle: (cycle: Cycle) => void;
  pushSharedGoal: (template: SharedGoalTemplate) => void;
  updateEscalationRules: (rules: EscalationRule[]) => void;
  getTeamSheets: (managerId: string) => { employee: User; sheet: GoalSheet | undefined }[];
  removeSharedGoal: (templateId: string) => void;
  unlockSheet: (sheetId: string) => void;
  activeCycle: Cycle | undefined;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  saveUser: (user: User) => void;
  deleteUser: (userId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  users: 'atomquest_users',
  currentUser: 'atomquest_current_user',
  goalSheets: 'atomquest_goal_sheets',
  checkIns: 'atomquest_checkins',
  auditLogs: 'atomquest_audit_logs',
  cycles: 'atomquest_cycles',
  sharedGoals: 'atomquest_shared_goals',
  escalation: 'atomquest_escalation',
  notifications: 'atomquest_notifications',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = load<User[]>(KEYS.users, []);
    if (stored.length === 0) {
      save(KEYS.users, SEED_USERS);
      return SEED_USERS;
    }
    return stored;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    load<User | null>(KEYS.currentUser, null)
  );

  const [goalSheets, setGoalSheets] = useState<GoalSheet[]>(() => {
    const stored = load<GoalSheet[]>(KEYS.goalSheets, []);
    if (stored.length === 0) {
      save(KEYS.goalSheets, SEED_GOAL_SHEETS);
      return SEED_GOAL_SHEETS;
    }
    return stored;
  });

  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    const stored = load<CheckIn[]>(KEYS.checkIns, []);
    if (stored.length === 0) {
      save(KEYS.checkIns, SEED_CHECKINS);
      return SEED_CHECKINS;
    }
    return stored;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const stored = load<AuditLog[]>(KEYS.auditLogs, []);
    if (stored.length === 0) {
      save(KEYS.auditLogs, SEED_AUDIT_LOGS);
      return SEED_AUDIT_LOGS;
    }
    return stored;
  });

  const [cycles, setCycles] = useState<Cycle[]>(() => {
    const stored = load<Cycle[]>(KEYS.cycles, []);
    if (stored.length === 0) {
      save(KEYS.cycles, [SEED_CYCLE]);
      return [SEED_CYCLE];
    }
    return stored;
  });

  const [sharedGoalTemplates, setSharedGoalTemplates] = useState<SharedGoalTemplate[]>(() =>
    load<SharedGoalTemplate[]>(KEYS.sharedGoals, [])
  );

  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>(() => {
    const stored = load<EscalationRule[]>(KEYS.escalation, []);
    if (stored.length === 0) {
      save(KEYS.escalation, SEED_ESCALATION_RULES);
      return SEED_ESCALATION_RULES;
    }
    return stored;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    load<AppNotification[]>(KEYS.notifications, [])
  );

  // ── Persist changes ─────────────────────────────────────────────────────────

  useEffect(() => { save(KEYS.users, users); }, [users]);
  useEffect(() => { save(KEYS.goalSheets, goalSheets); }, [goalSheets]);
  useEffect(() => { save(KEYS.checkIns, checkIns); }, [checkIns]);
  useEffect(() => { save(KEYS.auditLogs, auditLogs); }, [auditLogs]);
  useEffect(() => { save(KEYS.cycles, cycles); }, [cycles]);
  useEffect(() => { save(KEYS.sharedGoals, sharedGoalTemplates); }, [sharedGoalTemplates]);
  useEffect(() => { save(KEYS.escalation, escalationRules); }, [escalationRules]);
  useEffect(() => { save(KEYS.currentUser, currentUser); }, [currentUser]);
  useEffect(() => { save(KEYS.notifications, notifications); }, [notifications]);

  // ── Notification Helpers ────────────────────────────────────────────────────

  const notifyUser = useCallback((userId: string, title: string, message: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Send email as well
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      sendEmailNotification({
        to_name: targetUser.name,
        to_email: targetUser.email,
        subject: `AtomQuest: ${title}`,
        message: message,
      });

      // Send Teams Adaptive Card
      sendTeamsNotification({
        title: title,
        message: message,
        user: targetUser.name,
        statusColor: (title.includes('Approved') ? 'Good' : title.includes('Returned') ? 'Attention' : 'Default') as 'Good' | 'Attention' | 'Warning' | 'Default'
      });
    }
  }, [users]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.filter(n => n.userId !== currentUser?.id));
  }, [currentUser]);

  // ── User Management ─────────────────────────────────────────────────────────
  const saveUser = useCallback((user: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.map(u => u.id === user.id ? user : u);
      }
      return [...prev, user];
    });
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────

  const login = useCallback((email: string, password: string): boolean => {
    if (password !== 'password123') return false;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    setCurrentUser(user);
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // ── Goal Sheet helpers ──────────────────────────────────────────────────────

  const getSheet = useCallback((employeeId: string, cycleId: string) => {
    return goalSheets.find(s => s.employeeId === employeeId && s.cycleId === cycleId);
  }, [goalSheets]);

  const saveSheet = useCallback((sheet: GoalSheet) => {
    setGoalSheets(prev => {
      const idx = prev.findIndex(s => s.id === sheet.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = sheet;
        return next;
      }
      return [...prev, sheet];
    });
  }, []);

  const logAudit = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const entry: AuditLog = {
      ...log,
      id: `al-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [entry, ...prev]);
  }, []);

  const submitSheet = useCallback((sheetId: string) => {
    let empId = '';
    setGoalSheets(prev => prev.map(s => {
      if (s.id === sheetId) {
        empId = s.employeeId;
        return { ...s, status: 'submitted', submittedAt: new Date().toISOString() };
      }
      return s;
    }));

    // Trigger Notification to Manager
    const employee = users.find(u => u.id === empId);
    if (employee && employee.managerId) {
      notifyUser(employee.managerId, 'Goals Submitted', `${employee.name} has submitted their goals for approval.`);
    }
  }, [users, notifyUser]);

  const approveSheet = useCallback((sheetId: string, managerId: string) => {
    const now = new Date().toISOString();
    let empId = '';
    setGoalSheets(prev => prev.map(s => {
      if (s.id === sheetId) {
        empId = s.employeeId;
        return { ...s, status: 'approved', approvedAt: now, lockedAt: now };
      }
      return s;
    }));

    const manager = users.find(u => u.id === managerId);
    logAudit({
      userId: managerId,
      userName: manager?.name || 'Manager',
      action: 'GOAL_APPROVED',
      entityType: 'GoalSheet',
      entityId: sheetId,
      after: 'Goal sheet approved and locked',
    });

    // Notify Employee
    if (empId) {
      notifyUser(empId, 'Goals Approved', `Your goals have been approved by ${manager?.name}. They are now locked.`);
    }
  }, [users, logAudit, notifyUser]);

  const returnSheet = useCallback((sheetId: string, managerId: string, comment: string) => {
    let empId = '';
    setGoalSheets(prev => prev.map(s => {
      if (s.id === sheetId) {
        empId = s.employeeId;
        return { ...s, status: 'returned', managerComment: comment };
      }
      return s;
    }));

    const manager = users.find(u => u.id === managerId);
    logAudit({
      userId: managerId,
      userName: manager?.name || 'Manager',
      action: 'GOAL_RETURNED',
      entityType: 'GoalSheet',
      entityId: sheetId,
      after: `Returned with comment: ${comment}`,
    });

    // Notify Employee
    if (empId) {
      notifyUser(empId, 'Goals Returned', `Your goals were returned for rework by ${manager?.name}. Comment: "${comment}"`);
    }
  }, [users, logAudit, notifyUser]);

  const unlockSheet = useCallback((sheetId: string) => {
    let empId = '';
    setGoalSheets(prev => prev.map(s => {
      if (s.id === sheetId) {
        empId = s.employeeId;
        return { ...s, status: 'draft' };
      }
      return s;
    }));

    logAudit({
      userId: currentUser?.id || 'System',
      userName: currentUser?.name || 'Admin',
      action: 'GOAL_UNLOCKED',
      entityType: 'GoalSheet',
      entityId: sheetId,
      after: 'Goal sheet was unlocked by Admin',
    });

    if (empId) {
      notifyUser(empId, 'Goals Unlocked', 'Your goal sheet has been unlocked by an Admin. You can now make edits and resubmit.');
    }
  }, [currentUser, logAudit, notifyUser]);

  const updateActual = useCallback((
    sheetId: string, goalId: string, quarter: Quarter,
    actual: number | string, status: import('../types').GoalStatus, achievementDate?: string
  ) => {
    setGoalSheets(prev => {
      // Find the specific goal being updated
      let targetGoal: Goal | undefined;
      for (const sheet of prev) {
        if (sheet.id === sheetId) {
          targetGoal = sheet.goals.find(g => g.id === goalId);
          break;
        }
      }
      
      if (!targetGoal) return prev;

      const isPrimaryOwner = targetGoal.primaryOwnerId === currentUser?.id;
      const shouldSyncAll = targetGoal.isShared && targetGoal.sharedGoalId && isPrimaryOwner;

      return prev.map(sheet => {
        // If it's a shared goal updated by primary owner, update it in ALL sheets that have this shared goal.
        // Otherwise, only update the current sheet.
        if (!shouldSyncAll && sheet.id !== sheetId) return sheet;

        const updatedGoals = sheet.goals.map(goal => {
          const isTargetMatch = !shouldSyncAll ? (goal.id === goalId) : (goal.sharedGoalId === targetGoal?.sharedGoalId);
          if (!isTargetMatch) return goal;

          const score = calculateScore(goal.uom, goal.target, actual, achievementDate);
          const newActual = { quarter, actual, status, score, achievementDate, updatedAt: new Date().toISOString() };
          const actuals = goal.actuals.filter(a => a.quarter !== quarter);
          return { ...goal, actuals: [...actuals, newActual] };
        });

        return { ...sheet, goals: updatedGoals };
      });
    });
  }, [currentUser]);

  const saveCheckIn = useCallback((checkIn: CheckIn) => {
    setCheckIns(prev => {
      const idx = prev.findIndex(c => c.goalSheetId === checkIn.goalSheetId && c.quarter === checkIn.quarter && c.managerId === checkIn.managerId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = checkIn;
        return next;
      }
      return [...prev, checkIn];
    });

    // Notify Employee
    const manager = users.find(u => u.id === checkIn.managerId);
    notifyUser(checkIn.employeeId, 'Check-in Feedback Added', `${manager?.name} added feedback for your ${checkIn.quarter} check-in.`);
  }, [users, notifyUser]);

  const saveCycle = useCallback((cycle: Cycle) => {
    setCycles(prev => {
      const idx = prev.findIndex(c => c.id === cycle.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cycle;
        return next;
      }
      return [...prev, cycle];
    });
  }, []);

  const pushSharedGoal = useCallback((template: SharedGoalTemplate) => {
    setSharedGoalTemplates(prev => [...prev, template]);
    setGoalSheets(prev => {
      let updated = [...prev];
      for (const empId of template.pushedTo) {
        const sheetIdx = updated.findIndex(s => s.employeeId === empId && s.cycleId === template.cycleId);
        const sharedWeight = template.weightage ?? 10;
        const sharedGoal: Goal = {
          id: `g-shared-${Date.now()}-${empId}`,
          sheetId: sheetIdx >= 0 ? updated[sheetIdx].id : `gs-${empId}`,
          thrustArea: template.thrustArea,
          title: template.title,
          description: template.description,
          uom: template.uom,
          target: template.target,
          weightage: sharedWeight,
          isShared: true,
          sharedGoalId: template.id,
          primaryOwnerId: template.pushedBy,
          actuals: [],
          createdAt: new Date().toISOString(),
        };
        if (sheetIdx >= 0) {
          const existingGoals = updated[sheetIdx].goals;
          const currentTotal = existingGoals.reduce((s, g) => s + g.weightage, 0);
          // Auto-proportionally scale down existing goals to make room.
          // Guarantees total stays exactly 100% after the shared goal is added.
          let redistributedGoals = existingGoals;
          if (existingGoals.length > 0 && currentTotal > 0 && sharedWeight < 100) {
            const scaleFactor = (100 - sharedWeight) / currentTotal;
            let runningTotal = 0;
            redistributedGoals = existingGoals.map((g, i) => {
              if (i === existingGoals.length - 1) {
                // Last goal absorbs rounding remainder so total is exactly 100
                return { ...g, weightage: Math.max(1, (100 - sharedWeight) - runningTotal) };
              }
              const newW = Math.max(1, Math.round(g.weightage * scaleFactor));
              runningTotal += newW;
              return { ...g, weightage: newW };
            });
          }
          updated[sheetIdx] = {
            ...updated[sheetIdx],
            goals: [...redistributedGoals, sharedGoal],
          };
        } else {
          const newSheet: GoalSheet = {
            id: `gs-${empId}-${Date.now()}`,
            employeeId: empId,
            cycleId: template.cycleId,
            status: 'draft',
            goals: [sharedGoal],
          };
          updated = [...updated, newSheet];
        }

        // Notify each recipient
        notifyUser(empId, 'New Shared Goal', `A new shared goal "${template.title}" was added to your sheet.`);
      }
      return updated;
    });
  }, [notifyUser]);

  const removeSharedGoal = useCallback((templateId: string) => {
    setSharedGoalTemplates(prev => prev.filter(t => t.id !== templateId));
    setGoalSheets(prev => prev.map(sheet => ({
      ...sheet,
      goals: sheet.goals.filter(g => g.sharedGoalId !== templateId)
    })));
    logAudit({
      userId: currentUser?.id || 'System',
      userName: currentUser?.name || 'System',
      action: 'SHARED_GOAL_DELETED',
      entityType: 'SharedGoalTemplate',
      entityId: templateId,
      after: 'Shared goal template and corresponding goals deleted',
    });
  }, [currentUser, logAudit]);

  const updateEscalationRules = useCallback((rules: EscalationRule[]) => {
    setEscalationRules(rules);
  }, []);

  const getTeamSheets = useCallback((managerId: string) => {
    const teamMembers = users.filter(u => u.managerId === managerId);
    const activeCycle = cycles.find(c => c.isActive);
    return teamMembers.map(emp => ({
      employee: emp,
      sheet: activeCycle ? goalSheets.find(s => s.employeeId === emp.id && s.cycleId === activeCycle.id) : undefined,
    }));
  }, [users, goalSheets, cycles]);

  const activeCycle = cycles.find(c => c.isActive);

  return (
    <AppContext.Provider value={{
      users, currentUser, goalSheets, checkIns, auditLogs, cycles,
      sharedGoalTemplates, escalationRules, notifications,
      login, logout, getSheet, saveSheet, submitSheet, approveSheet, returnSheet,
      saveCheckIn, logAudit, updateActual, saveCycle, pushSharedGoal, removeSharedGoal,
      updateEscalationRules, getTeamSheets, activeCycle, unlockSheet,
      markNotificationRead, clearNotifications, saveUser, deleteUser
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
