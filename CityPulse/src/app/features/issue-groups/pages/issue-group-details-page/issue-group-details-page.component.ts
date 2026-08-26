import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IssueGroupStore } from '../../state/issue-group.store';
import { IssueGroupDetailsComponent } from '../../components/issue-group-details/issue-group-details.component';
import { IssueSeverity, IssueStatus } from '../../models/issue-group.model';

@Component({
  selector: 'app-issue-group-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink, IssueGroupDetailsComponent],
  template: `
    <div class="page-shell bg-background-alt/40">
      <div class="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <nav class="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3" aria-label="Breadcrumb">
          <ol class="flex min-w-0 items-center gap-2 text-sm text-content-muted">
            <li>
              <a
                routerLink="/admin/issue-groups"
                class="font-semibold transition-colors hover:text-primary"
              >
                Issue Groups
              </a>
            </li>
            <li aria-hidden="true" class="text-content-subtle">/</li>
            <li class="truncate font-mono text-xs text-content" aria-current="page">
              {{ currentId || 'Details' }}
            </li>
          </ol>

          <div class="flex items-center gap-3">
            <a
              routerLink="/admin/issue-groups"
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to list
            </a>
          </div>
        </nav>

        @if (store.actionSuccess()) {
          <div
            class="flex items-start justify-between gap-3 rounded-2xl border border-success/25 bg-success/10 px-4 py-3 text-success"
            role="status"
          >
            <div class="flex items-start gap-2.5">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm">{{ store.actionSuccess() }}</p>
            </div>
            <button
              type="button"
              (click)="store.clearAlerts()"
              class="rounded p-0.5 text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              aria-label="Dismiss message"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        }

        @if (store.actionError()) {
          <div
            class="flex items-start justify-between gap-3 rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-danger"
            role="alert"
          >
            <div class="flex items-start gap-2.5">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm">{{ store.actionError() }}</p>
            </div>
            <button
              type="button"
              (click)="store.clearAlerts()"
              class="rounded p-0.5 text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40"
              aria-label="Dismiss message"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        }

        @if (store.error() && !store.selectedGroup()) {
           <div class="glass-panel rounded-2xl px-6 py-12 text-center">
            <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
             <h2 class="mt-4 font-display text-xl font-bold text-content">Unable to load issue group</h2>
             <p class="mt-2 text-sm text-content-muted">{{ store.error() }}</p>
            <div class="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                (click)="loadGroup()"
                 class="btn-primary"
              >
                Try again
              </button>
              <a
                routerLink="/admin/issue-groups"
                 class="btn-secondary"
              >
                Return to list
              </a>
            </div>
          </div>
        }

        @if (store.isLoading()) {
          <div class="animate-pulse space-y-6" aria-busy="true" aria-label="Loading issue group">
             <div class="h-28 rounded-2xl bg-surface-elevated"></div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
               <div class="h-24 rounded-2xl bg-surface-elevated"></div>
               <div class="h-24 rounded-2xl bg-surface-elevated"></div>
               <div class="h-24 rounded-2xl bg-surface-elevated"></div>
               <div class="h-24 rounded-2xl bg-surface-elevated"></div>
            </div>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
               <div class="h-72 rounded-2xl bg-surface-elevated"></div>
               <div class="h-72 rounded-2xl bg-surface-elevated"></div>
            </div>
          </div>
        }

        @if (store.selectedGroup() && !store.isLoading()) {
          <app-issue-group-details
            [group]="store.selectedGroup()!"
            [isActionLoading]="store.isActionLoading()"
            (updateStatus)="onUpdateStatus($event)"
            (escalateSeverity)="onEscalateSeverity($event)"
            (recalculatePriority)="onRecalculatePriority()"
          />
        }
      </div>
    </div>
  `,
})
export class IssueGroupDetailsPageComponent implements OnInit, OnDestroy {
  protected readonly store = inject(IssueGroupStore);
  private readonly route = inject(ActivatedRoute);

  protected currentId = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.currentId = id;
        this.loadGroup();
      }
    });
  }

  ngOnDestroy(): void {
    this.store.clearAlerts();
  }

  protected loadGroup(): void {
    if (this.currentId) {
      this.store.loadGroupById(this.currentId);
    }
  }

  protected onUpdateStatus(event: { status: IssueStatus; note?: string | null }): void {
    if (this.currentId) {
      this.store.updateStatus(this.currentId, event.status, event.note);
    }
  }

  protected onEscalateSeverity(severity: IssueSeverity): void {
    if (this.currentId) {
      this.store.escalateSeverity(this.currentId, severity);
    }
  }

  protected onRecalculatePriority(): void {
    if (this.currentId) {
      this.store.recalculatePriority(this.currentId);
    }
  }
}
