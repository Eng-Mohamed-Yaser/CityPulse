import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    // Angular rejects `redirectTo` combined with `canActivate` (NG04014), and
    // that error aborts the whole navigation. The parent `/admin` route in
    // app.routes.ts already applies roleGuard, so this stays a plain redirect.
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    title: 'Admin Dashboard - CityPulse',
  },
  {
    path: 'issue-groups',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadChildren: () =>
      import('../issue-groups/issue-groups.routes').then(
        (m) => m.ISSUE_GROUPS_ROUTES
      ),
  },
];
