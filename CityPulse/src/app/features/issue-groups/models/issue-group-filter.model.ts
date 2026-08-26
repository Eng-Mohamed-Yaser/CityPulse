import { IssueCategory, IssueSeverity, IssueStatus } from './issue-group.model';

export interface IssueGroupFilters {
  // Server-side filters supported by GET /api/issue-groups
  category?: IssueCategory;
  status?: IssueStatus;
  page: number;
  limit: number;

  // Local/client-side filters on the loaded page
  search?: string;
  severity?: IssueSeverity;
}

export const DEFAULT_FILTERS: IssueGroupFilters = {
  page: 1,
  limit: 20,
  search: '',
};
