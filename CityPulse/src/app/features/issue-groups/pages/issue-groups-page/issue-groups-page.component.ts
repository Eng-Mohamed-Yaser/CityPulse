import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IssueGroupStore } from '../../state/issue-group.store';
import { IssueGroupCardComponent } from '../../components/issue-group-card/issue-group-card.component';
import { IssueGroupFiltersComponent } from '../../components/issue-group-filters/issue-group-filters.component';
import {
  ISSUE_CATEGORIES,
  IssueCategory,
  IssueSeverity,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from '../../models/issue-group.model';
import { IssueGroupFilters } from '../../models/issue-group-filter.model';

type ViewMode = 'grid' | 'table';

@Component({
  selector: 'app-issue-groups-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    IssueGroupCardComponent,
    IssueGroupFiltersComponent,
  ],
  template: `
    <div class="page-shell bg-background-alt/40">
      <div class="page-container">
        <!-- Page Header -->
        <header class="glass-panel flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div class="min-w-0">
            <p class="section-eyebrow">Administration</p>
            <h1 class="section-title mt-4">
              Issue Groups
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-relaxed text-content-muted sm:text-base">
              Monitor and manage reported community issues clustered by the CityPulse backend.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
             <button
              type="button"
              (click)="refresh()"
              [disabled]="store.isLoading()"
               class="btn-secondary px-3.5 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                class="h-4 w-4 text-slate-500"
                [class.animate-spin]="store.isLoading()"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <a
              routerLink="/admin/issue-groups/create"
              class="btn-primary px-3.5 py-2"
            >
              How clustering works
            </a>
          </div>
        </header>

        <!-- Summary Metrics -->
        <section
          class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6"
          aria-label="Issue group summary"
        >
          <div class="bg-surface px-4 py-4 sm:px-5">
            <p class="metric-label">Total</p>
            <p class="metric-value mt-2 text-2xl sm:text-3xl">{{ store.total() }}</p>
          </div>
          <div class="bg-surface px-4 py-4 sm:px-5">
            <p class="metric-label">On page</p>
            <p class="metric-value mt-2 text-2xl sm:text-3xl">{{ store.groups().length }}</p>
          </div>
          <div class="bg-surface px-4 py-4 sm:px-5">
            <p class="metric-label text-warning">Pending</p>
            <p class="metric-value mt-2 text-2xl sm:text-3xl">{{ store.summaryCounts().pending }}</p>
          </div>
          <div class="bg-surface px-4 py-4 sm:px-5">
            <p class="metric-label text-violet-600 dark:text-violet-400">In Progress</p>
            <p class="metric-value mt-2 text-2xl sm:text-3xl">{{ store.summaryCounts().inProgress }}</p>
          </div>
          <div class="bg-surface px-4 py-4 sm:px-5">
            <p class="metric-label text-success">Resolved</p>
            <p class="metric-value mt-2 text-2xl sm:text-3xl">{{ store.summaryCounts().resolved }}</p>
          </div>
          <div class="bg-surface px-4 py-4 sm:px-5">
            <p class="metric-label text-danger">Critical</p>
            <p class="metric-value mt-2 text-2xl sm:text-3xl">{{ store.summaryCounts().critical }}</p>
          </div>
        </section>

        <!-- Filters -->
        <app-issue-group-filters
          [filters]="store.filters()"
          (serverFilterChange)="onServerFilterChange($event)"
          (searchChange)="onSearchChange($event)"
          (severityChange)="onSeverityChange($event)"
          (reset)="onResetFilters()"
        />

        <!-- Controls -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Showing
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ store.filteredGroups().length }}</span>
            of
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ store.total() }}</span>
            issue groups
            @if (store.filters().search || store.filters().severity) {
              <span class="text-sky-700 dark:text-sky-400"> · filtered on page</span>
            }
          </p>

          <div
             class="inline-flex self-start rounded-xl border border-line bg-surface p-1 shadow-sm"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              (click)="setViewMode('grid')"
              [attr.aria-pressed]="viewMode() === 'grid'"
               [ngClass]="viewMode() === 'grid'
                 ? 'bg-primary text-primary-contrast shadow-sm'
                 : 'text-content-subtle hover:bg-background-alt'"
               class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              type="button"
              (click)="setViewMode('table')"
              [attr.aria-pressed]="viewMode() === 'table'"
               [ngClass]="viewMode() === 'table'
                 ? 'bg-primary text-primary-contrast shadow-sm'
                 : 'text-content-subtle hover:bg-background-alt'"
               class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Table
            </button>
          </div>
        </div>

        <!-- Error -->
        @if (store.error()) {
          <div
             class="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-5 sm:flex-row sm:items-start sm:justify-between"
            role="alert"
          >
            <div class="flex gap-3">
              <svg class="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                 <h2 class="text-sm font-semibold text-danger">Failed to load issue groups</h2>
                 <p class="mt-0.5 text-sm text-danger/80">{{ store.error() }}</p>
              </div>
            </div>
            <div class="flex shrink-0 gap-2 self-end sm:self-start">
              <button
                type="button"
                (click)="showTokenDialog.set(true)"
                 class="btn-secondary px-3 py-1.5 text-xs"
              >
                Set access token
              </button>
              <button
                type="button"
                (click)="refresh()"
                 class="btn-primary bg-danger px-3 py-1.5 text-xs hover:bg-danger"
              >
                Try again
              </button>
            </div>
          </div>
        }

        <!-- Token panel -->
        @if (showTokenDialog()) {
           <div class="glass-panel rounded-2xl p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                 <h2 class="text-sm font-semibold text-content">Access token</h2>
                 <p class="mt-1 text-sm text-content-muted">
                  Issue-group endpoints require a Bearer token. Paste your JWT to authenticate API calls.
                </p>
              </div>
              <button
                type="button"
                (click)="showTokenDialog.set(false)"
                class="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close token panel"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                [(ngModel)]="manualToken"
                placeholder="Paste JWT access token…"
                 class="field-input mt-0 min-w-0 flex-1"
              />
              <button
                type="button"
                (click)="saveToken()"
                 class="btn-primary px-4 py-2"
              >
                Save & connect
              </button>
              <button
                type="button"
                (click)="clearToken()"
                 class="btn-secondary px-3 py-2"
              >
                Clear
              </button>
            </div>
          </div>
        }

        <!-- Loading skeletons -->
        @if (store.isLoading()) {
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading issue groups">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
               <div class="animate-pulse rounded-2xl border border-line bg-surface p-5">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-md bg-slate-200 dark:bg-slate-800"></div>
                    <div class="space-y-2">
                      <div class="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800"></div>
                      <div class="h-3 w-14 rounded bg-slate-100 dark:bg-slate-800/80"></div>
                    </div>
                  </div>
                  <div class="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                </div>
                <div class="mt-5 grid grid-cols-2 gap-3">
                  <div class="h-12 rounded-md bg-slate-100 dark:bg-slate-800/70"></div>
                  <div class="h-12 rounded-md bg-slate-100 dark:bg-slate-800/70"></div>
                </div>
                <div class="mt-4 space-y-2">
                  <div class="h-3 w-full rounded bg-slate-100 dark:bg-slate-800"></div>
                  <div class="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty -->
        @if (store.isEmpty()) {
           <div class="glass-panel flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-16 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
             <h2 class="mt-4 font-display text-xl font-bold text-content">No issue groups found</h2>
             <p class="mt-2 max-w-sm text-sm leading-relaxed text-content-muted">
              No clusters match the current filters. Reset filters or wait for new citizen reports to be grouped by the backend.
            </p>
            <button
              type="button"
              (click)="onResetFilters()"
               class="btn-primary mt-5"
            >
              Reset filters
            </button>
          </div>
        }

        <!-- Grid -->
        @if (!store.isLoading() && store.filteredGroups().length > 0 && viewMode() === 'grid') {
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (group of store.filteredGroups(); track group._id) {
              <app-issue-group-card [group]="group" />
            }
          </div>
        }

        <!-- Table -->
        @if (!store.isLoading() && store.filteredGroups().length > 0 && viewMode() === 'table') {
           <div class="glass-panel overflow-x-auto rounded-2xl">
             <table class="w-full min-w-190 text-left text-sm">
               <thead class="border-b border-line bg-background-alt/70">
                 <tr class="text-[11px] font-semibold uppercase tracking-[0.12em] text-content-subtle">
                  <th scope="col" class="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" class="px-3 py-3 font-semibold">Severity</th>
                  <th scope="col" class="px-3 py-3 font-semibold">Status</th>
                  <th scope="col" class="px-3 py-3 text-center font-semibold">Reports</th>
                  <th scope="col" class="px-3 py-3 text-center font-semibold">Priority</th>
                  <th scope="col" class="px-3 py-3 font-semibold">Location</th>
                  <th scope="col" class="px-3 py-3 font-semibold">Updated</th>
                  <th scope="col" class="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
               <tbody class="divide-y divide-line">
                @for (group of store.filteredGroups(); track group._id) {
                   <tr class="transition-colors hover:bg-background-alt/60">
                    <td class="px-4 py-3">
                       <div class="font-medium text-content">{{ group.category }}</div>
                       <div class="font-mono text-[11px] text-content-subtle">#{{ group._id.slice(-6) }}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-3">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
                        [ngClass]="getSeverityConfig(group.severity).badgeClass"
                      >
                        <span class="h-1.5 w-1.5 rounded-full" [ngClass]="getSeverityConfig(group.severity).indicatorClass"></span>
                        {{ group.severity }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-3">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
                        [ngClass]="getStatusConfig(group.status).badgeClass"
                      >
                        <span class="h-1.5 w-1.5 rounded-full" [ngClass]="getStatusConfig(group.status).indicatorClass"></span>
                        {{ getStatusConfig(group.status).label }}
                      </span>
                    </td>
                     <td class="px-3 py-3 text-center tabular-nums font-semibold text-content">
                      {{ group.reportCount }}
                    </td>
                     <td class="px-3 py-3 text-center tabular-nums font-semibold text-content">
                       {{ group.priorityScore | number:'1.0-1' }}
                    </td>
                     <td class="px-3 py-3 font-mono text-xs text-content-muted">
                      {{ group.centerLocation.coordinates[1] | number:'1.3-3' }},
                      {{ group.centerLocation.coordinates[0] | number:'1.3-3' }}
                    </td>
                     <td class="whitespace-nowrap px-3 py-3 text-content-muted">
                      {{ group.updatedAt | date:'mediumDate' }}
                    </td>
                    <td class="px-4 py-3 text-right">
                      <a
                        [routerLink]="['/admin/issue-groups', group._id]"
                        class="font-medium text-sky-700 transition-colors hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        Details
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Pagination -->
        @if (!store.isLoading() && store.total() > 0) {
             <div class="glass-panel flex flex-col items-stretch justify-between gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center">
             <div class="flex flex-wrap items-center gap-3 text-sm text-content-muted">
              <span>
                Page
                 <span class="font-medium text-content">{{ store.page() }}</span>
                of
                 <span class="font-medium text-content">{{ store.totalPages() }}</span>
              </span>
              <div class="flex items-center gap-1.5">
                <label for="limit-select" class="text-xs">Show</label>
                <select
                  id="limit-select"
                  [ngModel]="store.limit()"
                  (ngModelChange)="onLimitChange($event)"
                   class="field-input mt-0 py-1 pl-2 pr-7"
                >
                  <option [ngValue]="10">10</option>
                  <option [ngValue]="20">20</option>
                  <option [ngValue]="50">50</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="store.previousPage()"
                [disabled]="!store.hasPrevPages() || store.isLoading()"
                 class="btn-secondary flex-1 px-3 py-1.5 disabled:opacity-40 sm:flex-none"
              >
                Previous
              </button>
              <button
                type="button"
                (click)="store.nextPage()"
                [disabled]="!store.hasMorePages() || store.isLoading()"
                 class="btn-secondary flex-1 px-3 py-1.5 disabled:opacity-40 sm:flex-none"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class IssueGroupsPageComponent implements OnInit {
  protected readonly store = inject(IssueGroupStore);
  private readonly route = inject(ActivatedRoute);
  protected readonly viewMode = signal<ViewMode>('grid');
  protected readonly showTokenDialog = signal<boolean>(false);
  protected manualToken = '';

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.manualToken =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        '';
    }

    // Accept deep links from the home page: `?search=` drives the existing
    // client-side filter, `?category=` the existing server-side filter.
    const params = this.route.snapshot.queryParamMap;
    const search = params.get('search');
    const category = params.get('category');

    if (search) {
      this.store.setLocalSearch(search);
    }

    if (category && (ISSUE_CATEGORIES as readonly string[]).includes(category)) {
      // changeFilters() issues the request itself, so don't also call loadGroups.
      this.store.changeFilters({ category: category as IssueCategory });
      return;
    }

    this.store.loadGroups();
  }

  protected saveToken(): void {
    if (typeof localStorage !== 'undefined') {
      if (this.manualToken?.trim()) {
        localStorage.setItem('accessToken', this.manualToken.trim());
      } else {
        localStorage.removeItem('accessToken');
      }
    }
    this.showTokenDialog.set(false);
    this.refresh();
  }

  protected clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('auth_token');
    }
    this.manualToken = '';
    this.showTokenDialog.set(false);
    this.refresh();
  }

  protected setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  protected refresh(): void {
    this.store.loadGroups();
  }

  protected onServerFilterChange(changes: Partial<IssueGroupFilters>): void {
    this.store.changeFilters(changes);
  }

  protected onSearchChange(query: string): void {
    this.store.setLocalSearch(query);
  }

  protected onSeverityChange(severity?: IssueSeverity): void {
    this.store.setLocalSeverity(severity);
  }

  protected onResetFilters(): void {
    this.store.resetFilters();
  }

  protected onLimitChange(limit: number): void {
    this.store.changeLimit(Number(limit));
  }

  protected getSeverityConfig(severity: IssueSeverity) {
    return SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.Low;
  }

  protected getStatusConfig(status: any) {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Pending;
  }
}
