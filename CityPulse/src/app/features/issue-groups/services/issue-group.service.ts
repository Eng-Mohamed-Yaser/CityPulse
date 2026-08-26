import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IssueCategory } from '../models/issue-group.model';
import { IssueGroupFilters } from '../models/issue-group-filter.model';
import {
  EscalateSeverityRequest,
  IssueGroupListResponse,
  IssueGroupNearbyResponse,
  IssueGroupSingleResponse,
  NearbyQueryParams,
  UpdateStatusRequest,
} from '../models/issue-group-request.model';

export const ISSUE_GROUPS_API_URL = new InjectionToken<string>(
  'ISSUE_GROUPS_API_URL',
  {
    providedIn: 'root',
    factory: () => '/api/issue-groups',
  }
);

@Injectable({
  providedIn: 'root',
})
export class IssueGroupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(ISSUE_GROUPS_API_URL);

  /**
   * Fetch paginated list of issue groups with server-side filters (category, status, page, limit).
   */
  getAll(filters?: Partial<IssueGroupFilters>): Observable<IssueGroupListResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
    }

    return this.http.get<IssueGroupListResponse>(this.apiUrl, { params });
  }

  /**
   * Fetch single issue group by ID.
   */
  getById(id: string): Observable<IssueGroupSingleResponse> {
    return this.http.get<IssueGroupSingleResponse>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  /**
   * Fetch nearby issue groups within radius (default 50m).
   */
  getNearby(params: NearbyQueryParams): Observable<IssueGroupNearbyResponse> {
    let httpParams = new HttpParams()
      .set('category', params.category)
      .set('longitude', params.longitude.toString())
      .set('latitude', params.latitude.toString());

    if (params.maxDistance !== undefined) {
      httpParams = httpParams.set('maxDistance', params.maxDistance.toString());
    }

    return this.http.get<IssueGroupNearbyResponse>(`${this.apiUrl}/nearby`, {
      params: httpParams,
    });
  }

  /**
   * Update issue group status (Pending -> InReview -> InProgress -> Resolved).
   */
  updateStatus(
    id: string,
    request: UpdateStatusRequest
  ): Observable<IssueGroupSingleResponse> {
    return this.http.patch<IssueGroupSingleResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}/status`,
      request
    );
  }

  /**
   * Escalate issue group severity (Low -> Medium -> High -> Critical).
   */
  escalateSeverity(
    id: string,
    request: EscalateSeverityRequest
  ): Observable<IssueGroupSingleResponse> {
    return this.http.patch<IssueGroupSingleResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}/severity`,
      request
    );
  }

  /**
   * Recalculate priority score on the backend.
   */
  recalculatePriority(id: string): Observable<IssueGroupSingleResponse> {
    return this.http.post<IssueGroupSingleResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}/recalculate-priority`,
      {}
    );
  }

  /**
   * Get the configured base API URL.
   */
  getApiUrl(): string {
    return this.apiUrl;
  }
}
