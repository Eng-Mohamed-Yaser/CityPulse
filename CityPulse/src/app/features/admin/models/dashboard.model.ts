export interface DashboardSummary {
  readonly totalReports: number;
  readonly totalGroups: number;
  readonly resolvedGroups: number;
  readonly resolvedRate: number;
}

export interface ReportsByCategory {
  readonly category: string;
  readonly reportCount: number;
}

export interface GroupsByLocation {
  readonly location: {
    readonly type: 'Point';
    readonly coordinates: readonly [number, number];
  };
  readonly groupCount: number;
}

export interface DashboardResponse<T> {
  readonly success: boolean;
  readonly data: T;
}
