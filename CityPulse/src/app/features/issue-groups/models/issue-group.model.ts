export type IssueCategory =
  | 'Pothole'
  | 'Streetlight'
  | 'WaterLeak'
  | 'Garbage'
  | 'RoadDamage'
  | 'Other';

export const ISSUE_CATEGORIES: IssueCategory[] = [
  'Pothole',
  'Streetlight',
  'WaterLeak',
  'Garbage',
  'RoadDamage',
  'Other',
];

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export const ISSUE_SEVERITIES: IssueSeverity[] = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

export type IssueStatus =
  | 'Pending'
  | 'InReview'
  | 'InProgress'
  | 'Resolved';

export const ISSUE_STATUSES: IssueStatus[] = [
  'Pending',
  'InReview',
  'InProgress',
  'Resolved',
];

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface StatusHistoryItem {
  status: IssueStatus;
  changedBy: string | null;
  changedAt: string;
  note: string | null;
}

export interface IssueGroup {
  _id: string;
  category: IssueCategory;
  centerLocation: GeoPoint;
  reportCount: number;
  lastReportAt?: string;
  priorityScore: number;
  severity: IssueSeverity;
  status: IssueStatus;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   Centralized Presentation Configurations
========================================================= */

export interface CategoryPresentation {
  label: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

export const CATEGORY_CONFIG: Record<IssueCategory, CategoryPresentation> = {
  Pothole: {
    label: 'Pothole',
    icon: 'circle-alert',
    colorClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
  },
  Streetlight: {
    label: 'Streetlight',
    icon: 'lightbulb',
    colorClass: 'text-yellow-700 dark:text-yellow-300',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800/40',
  },
  WaterLeak: {
    label: 'Water Leak',
    icon: 'droplets',
    colorClass: 'text-cyan-700 dark:text-cyan-300',
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40',
  },
  Garbage: {
    label: 'Garbage',
    icon: 'trash-2',
    colorClass: 'text-stone-700 dark:text-stone-300',
    bgClass: 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800/40',
  },
  RoadDamage: {
    label: 'Road Damage',
    icon: 'cone',
    colorClass: 'text-orange-700 dark:text-orange-300',
    bgClass: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/40',
  },
  Other: {
    label: 'Other',
    icon: 'help-circle',
    colorClass: 'text-slate-700 dark:text-slate-300',
    bgClass: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/40',
  },
};

export interface SeverityPresentation {
  label: string;
  badgeClass: string;
  indicatorClass: string;
  borderClass: string;
  order: number;
}

export const SEVERITY_CONFIG: Record<IssueSeverity, SeverityPresentation> = {
  Low: {
    label: 'Low',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    indicatorClass: 'bg-emerald-500',
    borderClass: 'border-emerald-400',
    order: 1,
  },
  Medium: {
    label: 'Medium',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    indicatorClass: 'bg-amber-500',
    borderClass: 'border-amber-400',
    order: 2,
  },
  High: {
    label: 'High',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50',
    indicatorClass: 'bg-orange-500',
    borderClass: 'border-orange-400',
    order: 3,
  },
  Critical: {
    label: 'Critical',
    badgeClass: 'bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50',
    indicatorClass: 'bg-red-500',
    borderClass: 'border-red-500',
    order: 4,
  },
};

export interface StatusPresentation {
  label: string;
  badgeClass: string;
  indicatorClass: string;
  borderClass: string;
  stepIndex: number;
  description: string;
}

export const STATUS_CONFIG: Record<IssueStatus, StatusPresentation> = {
  Pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    indicatorClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    stepIndex: 0,
    description: 'Awaiting initial municipal review and assignment.',
  },
  InReview: {
    label: 'In Review',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    indicatorClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    stepIndex: 1,
    description: 'Under active evaluation by municipal inspectors.',
  },
  InProgress: {
    label: 'In Progress',
    badgeClass: 'bg-violet-50 text-violet-800 border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50',
    indicatorClass: 'bg-violet-500',
    borderClass: 'border-violet-500',
    stepIndex: 2,
    description: 'Work crew is dispatched and repairs are underway.',
  },
  Resolved: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    indicatorClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    stepIndex: 3,
    description: 'Issue has been inspected and marked as resolved.',
  },
};
