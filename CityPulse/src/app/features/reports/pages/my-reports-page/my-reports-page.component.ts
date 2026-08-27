import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportService } from '../../services/report.service';
import { ReportRecord } from '../../models/report.model';
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  IssueStatus,
} from '../../../issue-groups/models/issue-group.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-reports-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page-shell bg-background-alt/40">
      <div class="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header class="glass-panel flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p class="section-eyebrow">Account activity</p>
            <h1 class="section-title mt-4">My Reports</h1>
            <p class="section-subtitle max-w-2xl">
              Follow the status of issues submitted from your CityPulse account.
            </p>
          </div>
          <a routerLink="/reports" class="btn-primary">Report an Issue</a>
        </header>

        @if (errorMessage()) {
          <div class="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {{ errorMessage() }}
          </div>
        }

        @if (isLoading()) {
          <div class="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading reports">
            @for (item of [1, 2, 3, 4]; track item) {
              <div class="h-48 animate-pulse rounded-2xl bg-surface-elevated"></div>
            }
          </div>
        } @else if (reports().length === 0) {
          <section class="glass-panel rounded-2xl px-6 py-16 text-center">
            <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </span>
            <h2 class="mt-4 font-display text-xl font-bold text-content">No reports yet</h2>
            <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">When you report a local problem, it will appear here with its current status and issue-group assignment.</p>
            <a routerLink="/reports" class="btn-primary mt-6">Submit your first report</a>
          </section>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2">
            @for (report of reports(); track report._id) {
              <article class="glass-card rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-xs font-semibold uppercase tracking-wider text-content-subtle">{{ categoryLabel(report) }}</p>
                    <h2 class="mt-1 truncate font-display text-lg font-bold text-content">{{ report.title }}</h2>
                  </div>
                  <span [class]="statusClass(report.status)">{{ statusLabel(report.status) }}</span>
                </div>
                <p class="mt-4 line-clamp-3 text-sm leading-relaxed text-content-muted">{{ report.description }}</p>
                <dl class="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
                  <div>
                    <dt class="text-xs text-content-subtle">Severity</dt>
                    <dd class="mt-1 text-sm font-semibold text-content">{{ report.severity }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs text-content-subtle">Submitted</dt>
                    <dd class="mt-1 text-sm font-semibold text-content">{{ report.createdAt | date:'mediumDate' }}</dd>
                  </div>
                  <div class="col-span-2">
                    <dt class="text-xs text-content-subtle">Location</dt>
                    <dd class="mt-1 font-mono text-xs text-content-muted">{{ coordinates(report) }}</dd>
                  </div>
                </dl>
                @if (report.issueGroupId) {
                  <p class="mt-4 rounded-lg bg-primary-subtle px-3 py-2 text-xs font-semibold text-primary">Assigned to an issue group</p>
                }
                <div class="mt-4 flex items-center gap-2 border-t border-line pt-4">
                  <a [routerLink]="['/reports', report._id, 'edit']" class="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-content transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Edit</a>
                  <button type="button" (click)="confirmDelete(report)" class="rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger">Delete</button>
                </div>
              </article>
            }
          </div>
        }

        @if (reportToDelete(); as report) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" (click)="cancelDelete()">
            <div class="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl" (click)="$event.stopPropagation()">
              <h2 class="font-display text-lg font-bold text-content">Delete report?</h2>
              <p class="mt-2 text-sm text-content-muted">This action cannot be undone. The report "<strong>{{ report.title }}</strong>" will be permanently removed.</p>
              <div class="mt-6 flex justify-end gap-3">
                <button type="button" (click)="cancelDelete()" class="rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-content transition-colors hover:border-primary">Cancel</button>
                <button type="button" (click)="deleteReport()" [disabled]="isDeleting()" class="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60">
                  @if (isDeleting()) {
                    <span class="inline-flex items-center gap-2">
                      <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                      Deleting…
                    </span>
                  } @else {
                    Delete
                  }
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </main>
  `,
})
export class MyReportsPageComponent {
  private readonly reportService = inject(ReportService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly reports = signal<readonly ReportRecord[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly reportToDelete = signal<ReportRecord | null>(null);
  protected readonly isDeleting = signal(false);

  constructor() {
    this.loadReports();
  }

  protected categoryLabel(report: ReportRecord): string {
    return CATEGORY_CONFIG[report.category]?.label ?? report.category;
  }

  protected statusLabel(status: IssueStatus): string {
    return STATUS_CONFIG[status]?.label ?? status;
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

  protected coordinates(report: ReportRecord): string {
    const [longitude, latitude] = report.location.coordinates;
    return `${longitude.toFixed(5)}, ${latitude.toFixed(5)}`;
  }

  protected confirmDelete(report: ReportRecord): void {
    this.reportToDelete.set(report);
  }

  protected cancelDelete(): void {
    this.reportToDelete.set(null);
  }

  protected deleteReport(): void {
    const report = this.reportToDelete();
    if (!report) return;

    this.isDeleting.set(true);
    this.reportService.delete(report._id).subscribe({
      next: () => {
        this.reports.set(this.reports().filter((r) => r._id !== report._id));
        this.reportToDelete.set(null);
        this.isDeleting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Failed to delete the report.');
        this.reportToDelete.set(null);
        this.isDeleting.set(false);
      },
    });
  }

  private loadReports(): void {
    const userId = this.auth.user()?.id;
    this.reportService.getAll().subscribe({
      next: (response) => {
        const mine = response.data.filter((report) => this.reportedById(report) === userId);
        this.reports.set(mine);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Unable to load your reports.');
        this.isLoading.set(false);
      },
    });
  }

  private reportedById(report: ReportRecord): string | undefined {
    return typeof report.reportedBy === 'string'
      ? report.reportedBy
      : report.reportedBy?._id;
  }
}
