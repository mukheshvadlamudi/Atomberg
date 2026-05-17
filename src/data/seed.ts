import { User, GoalSheet, Goal, CheckIn, AuditLog, Cycle, EscalationRule, Quarter, UoMType } from '../types';

// ─── Seed Users ──────────────────────────────────────────────────────────────

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@atomberg.com',
    role: 'employee',
    department: 'Sales',
    managerId: 'u3',
    designation: 'Sales Executive',
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    email: 'priya.sharma@atomberg.com',
    role: 'employee',
    department: 'Operations',
    managerId: 'u4',
    designation: 'Operations Analyst',
  },
  {
    id: 'u3',
    name: 'Rahul Joshi',
    email: 'rahul.joshi@atomberg.com',
    role: 'manager',
    department: 'Sales',
    designation: 'Sales Manager',
  },
  {
    id: 'u4',
    name: 'Sneha Patel',
    email: 'sneha.patel@atomberg.com',
    role: 'manager',
    department: 'Operations',
    designation: 'Operations Head',
  },
  {
    id: 'u5',
    name: 'Kavita Rao',
    email: 'kavita.rao@atomberg.com',
    role: 'admin',
    department: 'HR',
    designation: 'HR Business Partner',
  },
  {
    id: 'u6',
    name: 'Dev Singh',
    email: 'dev.singh@atomberg.com',
    role: 'employee',
    department: 'Sales',
    managerId: 'u3',
    designation: 'Key Account Manager',
  },
];

export const DEMO_CREDENTIALS = [
  { label: 'Employee', email: 'arjun.mehta@atomberg.com', password: 'password123', role: 'employee' },
  { label: 'Manager', email: 'rahul.joshi@atomberg.com', password: 'password123', role: 'manager' },
  { label: 'Admin/HR', email: 'kavita.rao@atomberg.com', password: 'password123', role: 'admin' },
];

// ─── Seed Cycle ───────────────────────────────────────────────────────────────

export const SEED_CYCLE: Cycle = {
  id: 'cycle-2026',
  name: 'FY 2025-26',
  year: 2026,
  isActive: true,
  goalSettingWindow: { opens: '2025-05-01', closes: '2025-05-31' },
  Q1: { opens: '2025-07-01', closes: '2025-07-31' },
  Q2: { opens: '2025-10-01', closes: '2025-10-31' },
  Q3: { opens: '2026-01-01', closes: '2026-01-31' },
  Q4: { opens: '2026-03-01', closes: '2026-04-30' },
};

// ─── Seed Goal Sheets ─────────────────────────────────────────────────────────

const NOW = new Date().toISOString();

export const SEED_GOAL_SHEETS: GoalSheet[] = [
  {
    id: 'gs-u1',
    employeeId: 'u1',
    cycleId: 'cycle-2026',
    status: 'draft',
    goals: [
      {
        id: 'g1',
        sheetId: 'gs-u1',
        thrustArea: 'Revenue Growth',
        title: 'Sales Revenue Target',
        description: 'Achieve quarterly sales revenue target across all product categories',
        uom: 'percent_min',
        target: 100,
        weightage: 40,
        isShared: false,
        actuals: [
          { quarter: 'Q1', actual: 85, status: 'on_track', score: 85, updatedAt: '2025-07-15T10:00:00Z' },
          { quarter: 'Q2', actual: 110, status: 'completed', score: 100, updatedAt: '2025-10-10T10:00:00Z' },
        ],
        createdAt: '2025-05-10T10:00:00Z',
      },
      {
        id: 'g2',
        sheetId: 'gs-u1',
        thrustArea: 'Customer Satisfaction',
        title: 'NPS Score Improvement',
        description: 'Improve Net Promoter Score by maintaining customer relationships',
        uom: 'numeric_min',
        target: 75,
        weightage: 25,
        isShared: false,
        actuals: [
          { quarter: 'Q1', actual: 68, status: 'on_track', score: 90.7, updatedAt: '2025-07-15T10:00:00Z' },
          { quarter: 'Q2', actual: 78, status: 'completed', score: 100, updatedAt: '2025-10-10T10:00:00Z' },
        ],
        createdAt: '2025-05-10T10:00:00Z',
      },
      {
        id: 'g3',
        sheetId: 'gs-u1',
        thrustArea: 'Process Efficiency',
        title: 'TAT Reduction',
        description: 'Reduce order turnaround time to improve delivery efficiency',
        uom: 'numeric_max',
        target: 3,
        weightage: 20,
        isShared: false,
        actuals: [
          { quarter: 'Q1', actual: 4, status: 'on_track', score: 75, updatedAt: '2025-07-15T10:00:00Z' },
        ],
        createdAt: '2025-05-10T10:00:00Z',
      },
      {
        id: 'g4',
        sheetId: 'gs-u1',
        thrustArea: 'Safety & Compliance',
        title: 'Zero Safety Incidents',
        description: 'Maintain zero workplace safety incidents throughout the year',
        uom: 'zero',
        target: 0,
        weightage: 15,
        isShared: true,
        primaryOwnerId: 'u1',
        actuals: [
          { quarter: 'Q1', actual: 0, status: 'completed', score: 100, updatedAt: '2025-07-15T10:00:00Z' },
          { quarter: 'Q2', actual: 0, status: 'completed', score: 100, updatedAt: '2025-10-10T10:00:00Z' },
        ],
        createdAt: '2025-05-10T10:00:00Z',
      },
    ],
  },
  {
    id: 'gs-u2',
    employeeId: 'u2',
    cycleId: 'cycle-2026',
    status: 'draft',
    goals: [
      {
        id: 'g5',
        sheetId: 'gs-u2',
        thrustArea: 'Process Efficiency',
        title: 'Process Automation Rate',
        description: 'Automate manual operational processes to improve efficiency',
        uom: 'percent_min',
        target: 80,
        weightage: 35,
        isShared: false,
        actuals: [],
        createdAt: '2025-05-14T09:00:00Z',
      },
      {
        id: 'g6',
        sheetId: 'gs-u2',
        thrustArea: 'Cost Optimisation',
        title: 'Operational Cost Reduction',
        description: 'Reduce operational costs by optimising vendor contracts and internal processes',
        uom: 'percent_max',
        target: 10,
        weightage: 30,
        isShared: false,
        actuals: [],
        createdAt: '2025-05-14T09:00:00Z',
      },
      {
        id: 'g7',
        sheetId: 'gs-u2',
        thrustArea: 'Team Development',
        title: 'Team Training Completion',
        description: 'Ensure 100% of team completes mandatory training modules by Q2',
        uom: 'timeline',
        target: '2025-10-31',
        weightage: 20,
        isShared: false,
        actuals: [],
        createdAt: '2025-05-14T09:00:00Z',
      },
      {
        id: 'g8',
        sheetId: 'gs-u2',
        thrustArea: 'Safety & Compliance',
        title: 'Zero Safety Incidents',
        description: 'Maintain zero workplace safety incidents throughout the year',
        uom: 'zero',
        target: 0,
        weightage: 15,
        isShared: true,
        actuals: [],
        createdAt: '2025-05-14T09:00:00Z',
      },
    ],
  },
  {
    id: 'gs-u6',
    employeeId: 'u6',
    cycleId: 'cycle-2026',
    status: 'draft',
    goals: [
      {
        id: 'g9',
        sheetId: 'gs-u6',
        thrustArea: 'Revenue Growth',
        title: 'Key Account Revenue',
        description: 'Grow revenue from key accounts by expanding product penetration',
        uom: 'numeric_min',
        target: 5000000,
        weightage: 50,
        isShared: false,
        actuals: [],
        createdAt: NOW,
      },
      {
        id: 'g10',
        sheetId: 'gs-u6',
        thrustArea: 'Customer Satisfaction',
        title: 'Account Retention Rate',
        description: 'Retain existing key accounts above 95% threshold',
        uom: 'percent_min',
        target: 95,
        weightage: 50,
        isShared: false,
        actuals: [],
        createdAt: NOW,
      },
    ],
  },
];

export const SEED_CHECKINS: CheckIn[] = [
  {
    id: 'ci1',
    managerId: 'u3',
    employeeId: 'u1',
    goalSheetId: 'gs-u1',
    quarter: 'Q1',
    comment: 'Arjun is making good progress. TAT is slightly behind — need to focus on streamlining the order process in Q2. Overall trajectory is positive.',
    createdAt: '2025-07-20T11:00:00Z',
  },
  {
    id: 'ci2',
    managerId: 'u3',
    employeeId: 'u1',
    goalSheetId: 'gs-u1',
    quarter: 'Q2',
    comment: 'Excellent Q2 performance! Sales revenue exceeded target and NPS is on a great trend. Keep it up heading into Q3.',
    createdAt: '2025-10-18T15:00:00Z',
  },
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'al1',
    userId: 'u3',
    userName: 'Rahul Joshi',
    action: 'GOAL_APPROVED',
    entityType: 'GoalSheet',
    entityId: 'gs-u1',
    after: 'Status changed to approved',
    timestamp: '2025-05-12T14:00:00Z',
  },
  {
    id: 'al2',
    userId: 'u1',
    userName: 'Arjun Mehta',
    action: 'GOAL_SUBMITTED',
    entityType: 'GoalSheet',
    entityId: 'gs-u1',
    after: 'Goal sheet submitted for approval',
    timestamp: '2025-05-10T10:00:00Z',
  },
  {
    id: 'al3',
    userId: 'u2',
    userName: 'Priya Sharma',
    action: 'GOAL_SUBMITTED',
    entityType: 'GoalSheet',
    entityId: 'gs-u2',
    after: 'Goal sheet submitted for approval',
    timestamp: '2025-05-14T09:00:00Z',
  },
];

export const SEED_ESCALATION_RULES: EscalationRule[] = [
  { id: 'er1', type: 'goal_not_submitted', daysThreshold: 7, isActive: true },
  { id: 'er2', type: 'goal_not_approved', daysThreshold: 5, isActive: true },
  { id: 'er3', type: 'checkin_not_done', daysThreshold: 10, isActive: false },
];

export const THRUST_AREAS = [
  'Revenue Growth',
  'Customer Satisfaction',
  'Process Efficiency',
  'Cost Optimisation',
  'People Development',
  'Team Development',
  'Safety & Compliance',
  'Innovation',
  'Sustainability',
  'Quality Improvement',
];

export const UOM_LABELS: Record<UoMType, string> = {
  numeric_min: 'Numeric (Higher is Better)',
  numeric_max: 'Numeric (Lower is Better)',
  percent_min: '% (Higher is Better)',
  percent_max: '% (Lower is Better)',
  timeline: 'Timeline / Date-based',
  zero: 'Zero-based (0 = Success)',
};

// ─── Score Calculation ────────────────────────────────────────────────────────

export function calculateScore(uom: UoMType, target: number | string, actual: number | string, achievementDate?: string): number {
  switch (uom) {
    case 'numeric_min':
    case 'percent_min': {
      const t = Number(target);
      const a = Number(actual);
      if (t === 0) return 0;
      return Math.min(100, (a / t) * 100);
    }
    case 'numeric_max':
    case 'percent_max': {
      const t = Number(target);
      const a = Number(actual);
      if (a === 0) return 100;
      return Math.min(100, (t / a) * 100);
    }
    case 'timeline': {
      if (!achievementDate || !target) return 0;
      const deadline = new Date(target as string);
      const completion = new Date(achievementDate);
      if (completion <= deadline) return 100;
      const diff = completion.getTime() - deadline.getTime();
      const totalDays = 90;
      const daysLate = diff / (1000 * 60 * 60 * 24);
      return Math.max(0, 100 - (daysLate / totalDays) * 100);
    }
    case 'zero': {
      return Number(actual) === 0 ? 100 : 0;
    }
    default:
      return 0;
  }
}

export function computeWeightedScore(goals: Goal[], quarter: Quarter): number {
  let totalScore = 0;
  for (const goal of goals) {
    const actual = goal.actuals.find(a => a.quarter === quarter);
    if (actual && actual.score !== undefined) {
      totalScore += (actual.score * goal.weightage) / 100;
    }
  }
  return Math.round(totalScore * 10) / 10;
}
