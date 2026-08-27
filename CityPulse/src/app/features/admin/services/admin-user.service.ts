import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PromoteUserRequest {
  email: string;
}

export interface PromoteUserResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin';

  promoteToAdmin(email: string): Observable<PromoteUserResponse> {
    return this.http.post<PromoteUserResponse>(`${this.apiUrl}/promote`, { email });
  }
}
