/**
 * Auth contracts aligned to the current server at CityPulse-Server/src/.
 *
 * Server state (verified 2026-08-26):
 * - Routes mounted at /api/auth (via app.ts)
 * - Register returns { success, message, data: { user, accessToken, refreshToken } }
 * - Login returns { success, message, data: { user, accessToken, refreshToken } }
 * - Refresh returns { success, message, data: { accessToken, refreshToken } }
 * - Logout returns { success, message }
 * - Refresh token is also sent as httpOnly cookie (citypulse_refresh_token)
 * - Role enum is capitalized: "Citizen" | "Admin"
 */

/** Server enum: CityPulse-Server/src/models/user.models.ts */
export type UserRole = 'Citizen' | 'Admin';

/** Public user projection decoded from the JWT and persisted locally. */
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

/** Registration fields submitted by the frontend form. */
export interface RegisterRequest {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

/** POST /api/auth/register — 201: { success, message, data: { user, accessToken, refreshToken } } */
export interface AuthResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: {
    readonly user: AuthUser;
    readonly accessToken: string;
    readonly refreshToken: string;
  };
}

/** POST /api/auth/refresh — 200: { success, message, data: { accessToken, refreshToken } } */
export interface RefreshResponse {
  readonly success: boolean;
  readonly message: string;
  readonly data: {
    readonly accessToken: string;
    readonly refreshToken: string;
  };
}

/** POST /api/auth/logout — 200: { success, message } */
export interface LogoutResponse {
  readonly success: boolean;
  readonly message: string;
}

/** JWT access token payload (from generatetoken payload shape in token.services.ts) */
export interface JwtUserPayload {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}

/** Validation error envelope from validate.middleware.ts */
export interface ValidationErrorResponse {
  readonly success: false;
  readonly message: string;
  readonly errors: readonly {
    readonly type: string;
    readonly msg: string;
    readonly path: string;
    readonly location: string;
  }[];
}

/** Generic server error envelope. */
export interface ErrorResponse {
  readonly msg: string;
  readonly message?: string;
}
