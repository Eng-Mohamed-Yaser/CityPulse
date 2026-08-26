import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { NotFoundComponent } from './components/not-found/not-found';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'CityPulse - Civic Intelligence'
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/pages/profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent
      ),
    title: 'Profile - CityPulse',
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    title: 'Access Restricted - CityPulse',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'issue-groups',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadChildren: () =>
      import('./features/issue-groups/issue-groups.routes').then(
        (m) => m.ISSUE_GROUPS_ROUTES
      ),
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - Page Not Found'
  }
];
