import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateReportRequest,
  ReportListResponse,
  ReportResponse,
  UpdateReportRequest,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/reports';

  create(request: CreateReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(this.apiUrl, request);
  }

  getAll(): Observable<ReportListResponse> {
    return this.http.get<ReportListResponse>(this.apiUrl);
  }

  getById(id: string): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  update(id: string, request: UpdateReportRequest): Observable<ReportResponse> {
    return this.http.put<ReportResponse>(`${this.apiUrl}/${encodeURIComponent(id)}`, request);
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}
