import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  CATEGORY_CONFIG,
  IssueGroup,
  IssueSeverity,
  IssueStatus,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from '../../models/issue-group.model';
import { IssueGroupMapComponent } from '../issue-group-map/issue-group-map.component';
import { IssueGroupStatusHistoryComponent } from '../issue-group-status-history/issue-group-status-history.component';
import { FormMode, IssueGroupFormComponent } from '../issue-group-form/issue-group-form.component';

@Component({
  selector: 'app-issue-group-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IssueGroupMapComponent,
    IssueGroupStatusHistoryComponent,
    IssueGroupFormComponent,
  ],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <section class="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex min-w-0 items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border"
              [ngClass]="categoryConfig().bgClass + ' ' + categoryConfig().colorClass"
              aria-hidden="true"
            >
              @switch (group.category) {
                @case ('Pothole') {
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <circle cx="12" cy="12" r="9" stroke-dasharray="3 3" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                  </svg>
                }
                @case ('Streetlight') {
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                }
                @case ('WaterLeak') {
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                }
                @case ('Garbage') {
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
                @case ('RoadDamage') {
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
                @default {
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              }
            </div>

            <div class="min-w-0">
              <h1 class="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
                {{ categoryConfig().label }}
              </h1>
              <p class="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                {{ group._id }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  [ngClass]="statusConfig().badgeClass"
                >
                  <span class="h-1.5 w-1.5 rounded-full" [ngClass]="statusConfig().indicatorClass"></span>
                  {{ statusConfig().label }}
                </span>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  [ngClass]="severityConfig().badgeClass"
                >
                  <span class="h-1.5 w-1.5 rounded-full" [ngClass]="severityConfig().indicatorClass"></span>
                  {{ severityConfig().label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="openForm('status')"
              [disabled]="isActionLoading"
              class="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              Change status
            </button>
            <button
              type="button"
              (click)="openForm('severity')"
              [disabled]="isActionLoading"
              class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Escalate severity
            </button>
            <button
              type="button"
              (click)="onRecalculatePriority()"
              [disabled]="isActionLoading"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              title="Trigger backend priority calculation"
            >
              @if (isActionLoading) {
                <svg class="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              Recalculate priority
            </button>
          </div>
        </div>

        @if (activeFormMode()) {
          <div class="mt-6">
            <app-issue-group-form
              [mode]="activeFormMode()!"
              [currentStatus]="group.status"
              [currentSeverity]="group.severity"
              [isLoading]="isActionLoading"
              (statusSubmit)="handleStatusSubmit($event)"
              (severitySubmit)="handleSeveritySubmit($event)"
              (formCancel)="closeForm()"
            />
          </div>
        }
      </section>

      <!-- Metrics -->
      <section
        class="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-800"
        aria-label="Issue metrics"
      >
        <div class="bg-white p-4 dark:bg-slate-900">
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Priority score
          </p>
          <p class="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
            {{ group.priorityScore }}
          </p>
          <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full transition-[width] duration-300"
              [style.width.%]="priorityPercent()"
              [ngClass]="severityConfig().indicatorClass"
            ></div>
          </div>
        </div>

        <div class="bg-white p-4 dark:bg-slate-900">
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Citizen reports
          </p>
          <p class="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
            {{ group.reportCount }}
          </p>
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Grouped within a 50m backend radius
          </p>
        </div>

        <div class="bg-white p-4 dark:bg-slate-900">
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Severity
          </p>
          <p class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {{ group.severity }}
          </p>
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Tier {{ severityConfig().order }} of 4
          </p>
        </div>

        <div class="bg-white p-4 dark:bg-slate-900">
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Activity
          </p>
          <dl class="mt-2 space-y-1.5 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500 dark:text-slate-400">Created</dt>
              <dd class="font-medium text-slate-800 dark:text-slate-200">{{ group.createdAt | date:'mediumDate' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-500 dark:text-slate-400">Last report</dt>
              <dd class="font-medium text-slate-800 dark:text-slate-200">
                {{ (group.lastReportAt || group.updatedAt) | date:'mediumDate' }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- Map + History -->
      <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <app-issue-group-map
          [centerLocation]="group.centerLocation"
          [category]="group.category"
          [reportCount]="group.reportCount"
        />
        <app-issue-group-status-history
          [statusHistory]="group.statusHistory"
          [currentStatus]="group.status"
        />
      </section>
    </div>
  `,
})
export class IssueGroupDetailsComponent {
  @Input({ required: true }) group!: IssueGroup;
  @Input() isActionLoading = false;

  @Output() updateStatus = new EventEmitter<{ status: IssueStatus; note?: string | null }>();
  @Output() escalateSeverity = new EventEmitter<IssueSeverity>();
  @Output() recalculatePriority = new EventEmitter<void>();

  protected readonly activeFormMode = signal<FormMode | null>(null);

  protected readonly categoryConfig = computed(
    () => CATEGORY_CONFIG[this.group.category] ?? CATEGORY_CONFIG.Other
  );

  protected readonly severityConfig = computed(
    () => SEVERITY_CONFIG[this.group.severity] ?? SEVERITY_CONFIG.Low
  );

  protected readonly statusConfig = computed(
    () => STATUS_CONFIG[this.group.status] ?? STATUS_CONFIG.Pending
  );

  protected readonly priorityPercent = computed(() => {
    return Math.min(100, Math.max(8, (this.group.priorityScore / 150) * 100));
  });

  protected openForm(mode: FormMode): void {
    this.activeFormMode.set(mode);
  }

  protected closeForm(): void {
    this.activeFormMode.set(null);
  }

  protected handleStatusSubmit(event: { status: IssueStatus; note?: string | null }): void {
    this.updateStatus.emit(event);
    this.closeForm();
  }

  protected handleSeveritySubmit(severity: IssueSeverity): void {
    this.escalateSeverity.emit(severity);
    this.closeForm();
  }

  protected onRecalculatePriority(): void {
    this.recalculatePriority.emit();
  }
}
