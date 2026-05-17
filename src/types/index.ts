// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
  avatar?: string;
  designation: string;
}

// ─── Goal ───────────────────────────────────────────────────────────────────

export type UoMType = 'numeric_min' | 'numeric_max' | 'percent_min' | 'percent_max' | 'timeline' | 'zero';

export type GoalStatus = 'not_started' | 'on_track' | 'completed';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface QuarterActual {
  quarter: Quarter;
  actual: number | string;
  achievementDate?: string;
  status: GoalStatus;
  score?: number;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  sheetId: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UoMType;
  target: number | string;
  weightage: number;
  isShared: boolean;
  sharedGoalId?: string;
  primaryOwnerId?: string;
  actuals: QuarterActual[];
  createdAt: string;
}

// ─── Goal Sheet ──────────────────────────────────────────────────────────────

export type SheetStatus = 'draft' | 'submitted' | 'approved' | 'returned';

export interface GoalSheet {
  id: string;
  employeeId: string;
  cycleId: string;
  status: SheetStatus;
  goals: Goal[];
  submittedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
  managerComment?: string;
}

// ─── Check-in ────────────────────────────────────────────────────────────────

export interface CheckIn {
  id: string;
  managerId: string;
  employeeId: string;
  goalSheetId: string;
  quarter: Quarter;
  comment: string;
  createdAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: string;
  after?: string;
  timestamp: string;
}

// ─── Cycle ───────────────────────────────────────────────────────────────────

export interface CycleWindow {
  opens: string;
  closes: string;
}

export interface Cycle {
  id: string;
  name: string;
  year: number;
  goalSettingWindow: CycleWindow;
  Q1: CycleWindow;
  Q2: CycleWindow;
  Q3: CycleWindow;
  Q4: CycleWindow;
  isActive: boolean;
}

// ─── Shared Goal Push ────────────────────────────────────────────────────────

export interface SharedGoalTemplate {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UoMType;
  target: number | string;
  weightage: number;
  pushedBy: string;
  pushedTo: string[];
  cycleId: string;
  createdAt: string;
}

// ─── Escalation Rule ─────────────────────────────────────────────────────────

export interface EscalationRule {
  id: string;
  type: 'goal_not_submitted' | 'goal_not_approved' | 'checkin_not_done';
  daysThreshold: number;
  isActive: boolean;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
