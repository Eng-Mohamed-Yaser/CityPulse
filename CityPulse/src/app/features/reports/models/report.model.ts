import {
  IssueCategory,
  IssueSeverity,
  IssueStatus,
} from '../../issue-groups/models/issue-group.model';

/** Flat request shape required by reports.validator.ts on the server. */
export interface CreateReportRequest {
  readonly title: string;
  readonly description: string;
  readonly category: IssueCategory;
  readonly severity: IssueSeverity;
  readonly longitude: number;
  readonly latitude: number;
  readonly imageUrl?: string | null;
}

export interface ReportLocation {
  readonly type: 'Point';
  /** GeoJSON order: [longitude, latitude]. */
  readonly coordinates: readonly [number, number];
}

export interface ReportIssueGroupReference {
  readonly _id?: string;
  readonly category?: IssueCategory;
  readonly reportCount?: number;
  readonly status?: IssueStatus;
  readonly severity?: IssueSeverity;
}

export interface ReportRecord {
  readonly _id: string;
  readonly title: string;
  readonly description: string;
  readonly category: IssueCategory;
  readonly severity: IssueSeverity;
  readonly status: IssueStatus;
  readonly location: ReportLocation;
  readonly imageUrl?: string | null;
  readonly reportedBy: string | { readonly _id?: string };
  readonly issueGroupId?: string | ReportIssueGroupReference | null;
  readonly isDeleted: boolean;
  readonly deletedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ReportListResponse {
  readonly success: boolean;
  readonly count: number;
  readonly data: readonly ReportRecord[];
}

export interface ReportResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: ReportRecord;
}
