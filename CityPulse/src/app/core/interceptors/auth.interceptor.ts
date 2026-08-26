import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  try {
    if (typeof localStorage !== 'undefined') {
      token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('jwt') ||
        localStorage.getItem('auth_token');
    }

    if (!token && typeof sessionStorage !== 'undefined') {
      token =
        sessionStorage.getItem('accessToken') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('jwt') ||
        sessionStorage.getItem('auth_token');
    }
  } catch {
    // Storage access might be restricted in some environments
    token = null;
  }

  // Clone request with Authorization header if token exists and always enable credentials for cookie auth
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token.trim()}`,
        },
        withCredentials: true,
      })
    : req.clone({
        withCredentials: true,
      });

  return next(authReq);
};
