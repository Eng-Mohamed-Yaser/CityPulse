import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor that automatically refreshes the access token when a 401
 * response is received, then retries the original request with the new token.
 *
 * Concurrent requests that all fail with 401 share a single refresh call
 * (via the auth service's refresh state).
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Skip refresh for the auth endpoints themselves (login, register, refresh, logout)
  // to avoid infinite loops.
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // If a refresh is already in progress, wait for it
      if (auth.isRefreshing()) {
        return auth.refreshPending$.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap((newToken) => {
            const clonedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(clonedReq);
          })
        );
      }

      // Start a new refresh
      auth.startRefresh();

      return auth.refresh().pipe(
        switchMap((response) => {
          const newToken = response.data.accessToken;
          auth.finishRefresh(newToken);

          const clonedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(clonedReq);
        }),
        catchError((refreshError) => {
          auth.finishRefresh(null);
          auth.clearSession();

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }

          return throwError(() => refreshError);
        })
      );
    })
  );
};
