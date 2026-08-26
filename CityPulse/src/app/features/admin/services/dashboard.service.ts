import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardResponse,
  DashboardSummary,
  GroupsByLocation,
  ReportsByCategory,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/dashboard';

  getSummary(): Observable<DashboardResponse<DashboardSummary>> {
    return this.http.get<DashboardResponse<DashboardSummary>>(`${this.apiUrl}/summary`);
  }

  getByCategory(): Observable<DashboardResponse<readonly ReportsByCategory[]>> {
    return this.http.get<DashboardResponse<readonly ReportsByCategory[]>>(`${this.apiUrl}/by-category`);
  }

  getByLocation(): Observable<DashboardResponse<readonly GroupsByLocation[]>> {
    return this.http.get<DashboardResponse<readonly GroupsByLocation[]>>(`${this.apiUrl}/by-location`);
  }
}
