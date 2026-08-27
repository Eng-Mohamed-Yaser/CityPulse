import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardSummary,
  GroupsByLocation,
  ReportsByCategory,
} from '../../models/dashboard.model';
import { IssueGroupService } from '../../../issue-groups/services/issue-group.service';
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  IssueGroup,
  IssueStatus,
} from '../../../issue-groups/models/issue-group.model';
import { AdminUserService } from '../../services/admin-user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page-shell bg-background-alt/40">
      <div class="page-container">
        <header class="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div aria-hidden="true" class="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
          <div>
            <p class="section-eyebrow">Operations center</p>
            <h1 class="section-title mt-4">Admin Dashboard</h1>
            <p class="section-subtitle max-w-2xl">
              Monitor reports, issue groups, and resolution progress across the CityPulse network.
            </p>
          </div>
          <button type="button" (click)="load()" [disabled]="isLoading()" class="btn-secondary relative self-start sm:self-auto">
            <svg class="h-4 w-4" [class.animate-spin]="isLoading()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh data
          </button>
        </header>

        @if (errorMessage()) {
          <section class="flex flex-col gap-4 rounded-2xl border border-danger/30 bg-danger/10 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <div class="flex items-start gap-3 text-danger">
              <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
              <div>
                <h2 class="font-semibold">Unable to load dashboard data</h2>
                <p class="mt-1 text-sm text-danger/80">{{ errorMessage() }}</p>
              </div>
            </div>
            <button type="button" (click)="load()" class="btn-secondary">Try again</button>
          </section>
        }

        @if (isLoading()) {
          <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading dashboard summary">
            @for (item of [1, 2, 3, 4]; track item) {
              <div class="h-32 animate-pulse rounded-2xl bg-surface-elevated"></div>
            }
          </section>
          <section class="grid gap-6 xl:grid-cols-2">
            <div class="h-80 animate-pulse rounded-2xl bg-surface-elevated"></div>
            <div class="h-80 animate-pulse rounded-2xl bg-surface-elevated"></div>
          </section>
        } @else if (summary(); as totals) {
          <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard summary">
            <article class="glass-card group relative overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <span class="dashboard-icon bg-primary-subtle text-primary"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 6h8M8 10h8M8 14h5m-8 7h10a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3Z" /></svg></span>
              <p class="metric-label mt-5">Total Reports</p>
              <p class="metric-value">{{ totals.totalReports }}</p>
              <p class="metric-note">All non-deleted reports</p>
            </article>
            <article class="glass-card group relative overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <span class="dashboard-icon bg-accent-subtle text-accent"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="7" cy="5" r="2.5" /><circle cx="7" cy="19" r="2.5" /><circle cx="17" cy="12" r="2.5" /><path stroke-linecap="round" d="m9.2 6.2 5.6 4.1m-5.6 7.5 5.6-4.1" /></svg></span>
              <p class="metric-label mt-5">Issue Groups</p>
              <p class="metric-value">{{ totals.totalGroups }}</p>
              <p class="metric-note">Grouped city problems</p>
            </article>
            <article class="glass-card group relative overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <span class="dashboard-icon bg-success/15 text-success"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" /></svg></span>
              <p class="metric-label mt-5">Resolved Groups</p>
              <p class="metric-value">{{ totals.resolvedGroups }}</p>
              <p class="metric-note">Marked resolved by teams</p>
            </article>
            <article class="glass-card group relative overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <span class="dashboard-icon bg-warning/15 text-warning"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19V5m0 14h16M8 16v-3m4 3V8m4 8v-6" /></svg></span>
              <p class="metric-label mt-5">Resolved Rate</p>
              <p class="metric-value">{{ totals.resolvedRate | number:'1.0-2' }}%</p>
              <p class="metric-note">Across all issue groups</p>
            </article>
          </section>

          <section class="grid gap-6 xl:grid-cols-2">
            <article class="glass-panel rounded-2xl p-6 sm:p-7" aria-labelledby="category-heading">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h2 id="category-heading" class="font-display text-lg font-bold text-content">Reports by Category</h2>
                  <p class="mt-1 text-sm text-content-muted">Where residents are reporting problems.</p>
                </div>
                <span class="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary">{{ categoryTotal() }} total</span>
              </div>

              @if (categories().length === 0) {
                <div class="empty-chart">No category data yet.</div>
              } @else {
                <div class="mt-7 space-y-4">
                  @for (item of categories(); track item.category) {
                    <div>
                      <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span class="font-medium text-content">{{ categoryLabel(item.category) }}</span>
                        <span class="font-mono text-xs text-content-muted">{{ item.reportCount }}</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-background-alt">
                        <div class="h-full rounded-full bg-primary transition-all" [style.width.%]="categoryWidth(item.reportCount)"></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </article>

            <article class="glass-panel rounded-2xl p-6 sm:p-7" aria-labelledby="location-heading">
              <div>
                <h2 id="location-heading" class="font-display text-lg font-bold text-content">Groups by Location</h2>
                <p class="mt-1 text-sm text-content-muted">The most concentrated issue areas returned by the backend.</p>
              </div>

              @if (locations().length === 0) {
                <div class="empty-chart">No location data yet.</div>
              } @else {
                <ol class="mt-7 space-y-4">
                  @for (item of locations(); track $index) {
                    <li>
                      <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span class="font-mono text-xs text-content-muted">{{ locationLabel(item) }}</span>
                        <span class="font-semibold text-content">{{ item.groupCount }} groups</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-background-alt">
                        <div class="h-full rounded-full bg-accent transition-all" [style.width.%]="locationWidth(item.groupCount)"></div>
                      </div>
                    </li>
                  }
                </ol>
              }
            </article>
          </section>

          <section class="glass-panel rounded-2xl p-6 sm:p-7" aria-labelledby="priority-heading">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="priority-heading" class="font-display text-lg font-bold text-content">High-Priority Issue Groups</h2>
                <p class="mt-1 text-sm text-content-muted">Backend priority scores, ordered for administrative attention.</p>
              </div>
              <a routerLink="/admin/issue-groups" class="btn-secondary">Manage issue groups</a>
            </div>

            @if (priorityGroups().length === 0) {
              <div class="empty-chart">No issue groups are available yet.</div>
            } @else {
              <div class="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                @for (group of priorityGroups(); track group._id) {
                  <a [routerLink]="['/admin/issue-groups', group._id]" class="group rounded-xl border border-line bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-xs font-semibold uppercase tracking-wider text-content-subtle">{{ categoryLabel(group.category) }}</p>
                        <p class="mt-1 truncate text-sm font-bold text-content">{{ group.reportCount }} reports grouped</p>
                      </div>
                      <span [class]="statusClass(group.status)">{{ statusLabel(group.status) }}</span>
                    </div>
                    <div class="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p class="text-[11px] uppercase tracking-wider text-content-subtle">Priority</p>
                        <p class="mt-1 font-display text-xl font-bold text-content">{{ group.priorityScore | number:'1.0-1' }}</p>
                      </div>
                      <p class="text-right text-xs text-content-muted">Updated<br />{{ group.updatedAt | date:'mediumDate' }}</p>
                    </div>
                  </a>
                }
              </div>
            }
          </section>
        }

        <section class="glass-panel rounded-2xl p-6 sm:p-7" aria-labelledby="promote-heading">
          <div>
            <h2 id="promote-heading" class="font-display text-lg font-bold text-content">Promote User to Admin</h2>
            <p class="mt-1 text-sm text-content-muted">Enter the email address of an existing citizen to grant them admin access.</p>
          </div>

          <form (ngSubmit)="promoteUser()" class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div class="flex-1">
              <label for="promote-email" class="field-label text-xs">Email address</label>
              <input
                id="promote-email"
                type="email"
                [(ngModel)]="promoteEmail"
                name="promoteEmail"
                placeholder="user@example.com"
                required
                class="field-input mt-0"
              />
            </div>
            <button
              type="submit"
              [disabled]="!promoteEmail || isPromoting()"
              class="btn-primary inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              @if (isPromoting()) {
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Promoting…
              } @else {
                Promote to Admin
              }
            </button>
          </form>

          @if (promoteSuccess()) {
            <div class="mt-3 flex items-start gap-2.5 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
              <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ promoteSuccess() }}
            </div>
          }

          @if (promoteError()) {
            <div class="mt-3 flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
              <svg class="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ promoteError() }}
            </div>
          }
        </section>
      </div>
    </main>
  `,
})
export class AdminDashboardComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly issueGroups = inject(IssueGroupService);
  private readonly adminUser = inject(AdminUserService);

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly summary = signal<DashboardSummary | null>(null);
  protected readonly categories = signal<readonly ReportsByCategory[]>([]);
  protected readonly locations = signal<readonly GroupsByLocation[]>([]);
  protected readonly priorityGroups = signal<readonly IssueGroup[]>([]);
  protected readonly categoryConfig = CATEGORY_CONFIG;

  protected promoteEmail = '';
  protected readonly isPromoting = signal(false);
  protected readonly promoteSuccess = signal<string | null>(null);
  protected readonly promoteError = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      summary: this.dashboard.getSummary(),
      categories: this.dashboard.getByCategory(),
      locations: this.dashboard.getByLocation(),
      groups: this.issueGroups.getAll({ page: 1, limit: 20 }),
    }).subscribe({
      next: (result) => {
        this.summary.set(result.summary.data);
        this.categories.set(result.categories.data);
        this.locations.set(result.locations.data);
        this.priorityGroups.set(
          [...result.groups.data.groups]
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, 6)
        );
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'The dashboard data could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }

  protected categoryLabel(category: string): string {
    return this.categoryConfig[category as keyof typeof this.categoryConfig]?.label ?? category;
  }

  protected categoryTotal(): number {
    return this.categories().reduce((total, item) => total + item.reportCount, 0);
  }

  protected categoryWidth(count: number): number {
    const max = Math.max(...this.categories().map((item) => item.reportCount), 1);
    return (count / max) * 100;
  }

  protected locationWidth(count: number): number {
    const max = Math.max(...this.locations().map((item) => item.groupCount), 1);
    return (count / max) * 100;
  }

  protected locationLabel(item: GroupsByLocation): string {
    const [longitude, latitude] = item.location.coordinates;
    return `${longitude.toFixed(4)}, ${latitude.toFixed(4)}`;
  }

  protected statusLabel(status: IssueStatus): string {
    return STATUS_CONFIG[status].label;
  }

  protected statusClass(status: IssueStatus): string {
    const classes: Record<IssueStatus, string> = {
      Pending: 'status-badge status-pending',
      InReview: 'status-badge status-review',
      InProgress: 'status-badge status-progress',
      Resolved: 'status-badge status-resolved',
    };
    return classes[status];
  }

  protected promoteUser(): void {
    if (!this.promoteEmail || this.isPromoting()) return;

    this.isPromoting.set(true);
    this.promoteSuccess.set(null);
    this.promoteError.set(null);

    this.adminUser.promoteToAdmin(this.promoteEmail).subscribe({
      next: (res) => {
        this.promoteSuccess.set(res.message);
        this.promoteEmail = '';
        this.isPromoting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.promoteError.set(err.error?.message ?? 'Failed to promote user');
        this.isPromoting.set(false);
      },
    });
  }
}
