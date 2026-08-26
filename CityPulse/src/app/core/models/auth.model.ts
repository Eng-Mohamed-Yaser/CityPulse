/**
 * Auth contracts.
 *
 * These mirror the shapes the existing CityPulse server already returns from
 * `/api/auth/*` (see CityPulse-Server/src/controllers/auth.controller.ts and
 * services/auth.service.ts). They are declared here because the Angular and
 * server projects have separate tsconfigs and cannot share types — this is not
 * a duplicated model of an existing Angular interface.
 *
 * Nothing in this file changes a backend contract.
 */

/** Server enum: CityPulse-Server/src/models/user.models.ts */
export type UserRole = 'Citizen' | 'Admin';

/** Public user projection returned by register/login. */
export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

/** `POST /api/auth/login` (200) and `POST /api/auth/register` (201). */
export interface AuthResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: {
    readonly user: AuthUser;
    readonly accessToken: string;
  };
}

/** `POST /api/auth/refresh` (200) — refresh token travels as an httpOnly cookie. */
export interface RefreshResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: {
    readonly accessToken: string;
  };
}

/** `POST /api/auth/logout` (200). */
export interface LogoutResponse {
  readonly success: boolean;
  readonly message: string;
}

/** Error envelope emitted by errorHandler.middleware.ts. */
export interface ApiErrorResponse {
  readonly success: false;
  readonly message: string;
  readonly errors?: readonly { readonly field: string; readonly message: string }[];
}
