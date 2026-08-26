import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

/**
 * NOTE: this layout is not currently referenced by ISSUE_GROUPS_ROUTES — each
 * issue-groups page renders its own full-page shell instead. Kept as-is, but
 * the theme switcher now delegates to ThemeToggleComponent rather than the
 * previous no-op stub, so it behaves correctly if this layout is ever routed.
 */
@Component({
  selector: 'app-issue-groups-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './issue-groups-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueGroupsLayoutComponent {}
