import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
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
