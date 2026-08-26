import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import {
  ApiErrorResponse,
  AuthResponse,
  AuthUser,
  LoginRequest,
  LogoutResponse,
  RefreshResponse,
  RegisterRequest,
} from '../models/auth.model';

export const AUTH_API_URL = new InjectionToken<string>('AUTH_API_URL', {
  providedIn: 'root',
  factory: () => '/api/auth',
});

/**
 * `accessToken` is deliberately the storage key: the pre-existing
 * `authInterceptor` reads `localStorage.getItem('accessToken')` first, and the
 * pre-existing manual token panel on the issue-groups page writes to the same
 * key. Using it means neither has to be modified.
 */
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'citypulse-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(AUTH_API_URL);

  private readonly userState = signal<AuthUser | null>(this.readStoredUser());
  private readonly tokenState = signal<string | null>(this.readStoredToken());

  readonly user = this.userState.asReadonly();
  readonly token = this.tokenState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);
  readonly isAdmin = computed(() => this.userState()?.role === 'Admin');

  /** `POST /api/auth/register` — 201 on success, 409 if the email is taken. */
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        tap((response) => this.persistSession(response)),
        catchError(this.toMessage)
      );
  }

  /** `POST /api/auth/login` — 401 on bad credentials, 403 if inactive. */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => this.persistSession(response)),
        catchError(this.toMessage)
      );
  }

  /**
   * `POST /api/auth/refresh` — the refresh token is an httpOnly cookie scoped
   * to `/api/auth`, sent automatically because the existing interceptor sets
   * `withCredentials: true` on every request.
   */
  refresh(): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap((response) => this.storeToken(response.data.accessToken)),
      catchError(this.toMessage)
    );
  }

  /** `POST /api/auth/logout` — idempotent server-side; clears local state regardless. */
  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError((error: HttpErrorResponse) => {
        // A failed logout must still drop the local session.
        this.clearSession();
        return this.toMessage(error);
      })
    );
  }

  clearSession(): void {
    this.userState.set(null);
    this.tokenState.set(null);
    this.safeStorage((storage) => {
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(USER_KEY);
    });
  }

  private persistSession(response: AuthResponse): void {
    this.userState.set(response.data.user);
    this.storeToken(response.data.accessToken);
    this.safeStorage((storage) =>
      storage.setItem(USER_KEY, JSON.stringify(response.data.user))
    );
  }

  private storeToken(token: string): void {
    this.tokenState.set(token);
    this.safeStorage((storage) => storage.setItem(ACCESS_TOKEN_KEY, token));
  }

  /** Surface the server's own message so forms can show something useful. */
  private readonly toMessage = (error: HttpErrorResponse): Observable<never> => {
    const body = error.error as ApiErrorResponse | null;
    const message =
      body?.message ??
      (error.status === 0
        ? 'Cannot reach the CityPulse server. Please try again.'
        : 'Something went wrong. Please try again.');

    return throwError(() => new Error(message));
  };

  private readStoredToken(): string | null {
    let token: string | null = null;
    this.safeStorage((storage) => {
      token = storage.getItem(ACCESS_TOKEN_KEY);
    });
    return token;
  }

  private readStoredUser(): AuthUser | null {
    let raw: string | null = null;
    this.safeStorage((storage) => {
      raw = storage.getItem(USER_KEY);
    });

    if (raw === null) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  /** localStorage can throw in private modes / restricted embeds. */
  private safeStorage(operation: (storage: Storage) => void): void {
    try {
      if (typeof localStorage !== 'undefined') {
        operation(localStorage);
      }
    } catch {
      // Ignore: auth still works for the lifetime of the page in memory.
    }
  }
}
