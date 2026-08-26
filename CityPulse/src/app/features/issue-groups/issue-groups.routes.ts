import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const ISSUE_GROUPS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./pages/issue-groups-page/issue-groups-page.component').then(
        (m) => m.IssueGroupsPageComponent
      ),
  },
  {
    path: 'create',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./pages/issue-group-info-page/issue-group-info-page.component').then(
        (m) => m.IssueGroupInfoPageComponent
      ),
  },
  {
    path: ':id',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import(
        './pages/issue-group-details-page/issue-group-details-page.component'
      ).then((m) => m.IssueGroupDetailsPageComponent),
  },
];
