import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

/**
 * Role-based route guard. Authentication is checked here as well so a route
 * cannot accidentally become role-only and bypass the login redirect.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] as readonly UserRole[] | undefined) ?? [];

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (roles.includes(auth.user()?.role ?? 'Citizen')) {
    return true;
  }

  return router.createUrlTree(['/unauthorized'], {
    queryParams: { returnUrl: state.url },
  });
};
