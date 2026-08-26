import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateReportRequest,
  ReportListResponse,
  ReportResponse,
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
}
