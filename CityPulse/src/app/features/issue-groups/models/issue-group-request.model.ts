import { IssueCategory, IssueGroup, IssueSeverity, IssueStatus } from './issue-group.model';

export interface UpdateStatusRequest {
  status: IssueStatus;
  note?: string | null;
}

export interface EscalateSeverityRequest {
  severity: IssueSeverity;
}

export interface IssueGroupListResponse {
  success: boolean;
  data: {
    groups: IssueGroup[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface IssueGroupSingleResponse {
  success: boolean;
  message?: string;
  data: IssueGroup;
}

export interface IssueGroupNearbyResponse {
  success: boolean;
  data: IssueGroup[];
}

export interface NearbyQueryParams {
  category: IssueCategory;
  longitude: number;
  latitude: number;
  maxDistance?: number;
}
