import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'mine',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-reports-page/my-reports-page.component').then(
        (m) => m.MyReportsPageComponent
      ),
    title: 'My Reports - CityPulse',
  },
  {
    path: ':id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/edit-report-page/edit-report-page.component').then(
        (m) => m.EditReportPageComponent
      ),
    title: 'Edit Report - CityPulse',
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reports-page/reports-page.component').then(
        (m) => m.ReportsPageComponent
      ),
    title: 'Report an Issue - CityPulse',
  },
];
