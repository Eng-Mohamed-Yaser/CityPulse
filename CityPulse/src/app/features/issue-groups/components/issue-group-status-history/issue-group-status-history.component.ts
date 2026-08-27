import { Component, Input, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ISSUE_STATUSES,
  IssueStatus,
  STATUS_CONFIG,
  StatusHistoryItem,
} from '../../models/issue-group.model';

@Component({
  selector: 'app-issue-group-status-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <section class="glass-panel rounded-2xl p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
         <h2 class="font-display text-base font-bold text-content">Status history</h2>
         <p class="mt-1 text-xs text-content-muted">
            Workflow progression and audit log
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
          [ngClass]="currentStatusConfig().badgeClass"
        >
          <span class="h-1.5 w-1.5 rounded-full" [ngClass]="currentStatusConfig().indicatorClass"></span>
          {{ currentStatusConfig().label }}
        </span>
      </div>

      <!-- Compact step rail -->
      <div class="mt-5 hidden sm:block">
        <ol class="grid grid-cols-4 gap-2" aria-label="Workflow stages">
          @for (step of allStatuses; track step; let idx = $index) {
            <li class="text-center">
              <div
                class="mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold"
                [ngClass]="getStepIndicatorClass(step, idx)"
              >
                @if (isStepCompleted(idx)) {
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  {{ idx + 1 }}
                }
              </div>
              <p class="mt-1.5 text-[11px] font-medium" [ngClass]="getStepLabelClass(step, idx)">
                {{ getStatusLabel(step) }}
              </p>
            </li>
          }
        </ol>
      </div>

      <div class="mt-6">
         <h3 class="metric-label">
          Timeline · {{ statusHistory.length }}
          {{ statusHistory.length === 1 ? 'event' : 'events' }}
        </h3>

        @if (statusHistory.length === 0) {
             <p class="mt-4 rounded-xl border border-dashed border-line-strong bg-background-alt px-4 py-6 text-center text-sm text-content-muted">
            No status history recorded yet.
          </p>
        } @else {
           <ol class="relative mt-4 space-y-0 border-l border-line-strong pl-5">
            @for (entry of statusHistory; track entry.changedAt + '-' + entry.status) {
              <li class="relative pb-6 last:pb-0">
                <span
                   class="absolute top-1.5 left-[-1.4rem] h-2.5 w-2.5 rounded-full ring-4 ring-surface"
                  [ngClass]="getStatusConfig(entry.status).indicatorClass"
                  aria-hidden="true"
                ></span>

                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                      [ngClass]="getStatusConfig(entry.status).badgeClass"
                    >
                      {{ getStatusConfig(entry.status).label }}
                    </span>
                    @if (entry.changedBy) {
                       <span class="text-xs text-content-muted">
                        by
                         <span class="font-mono text-content">#{{ entry.changedBy.slice(-6) }}</span>
                      </span>
                    } @else {
                       <span class="text-xs text-content-subtle">System</span>
                    }
                  </div>
                   <time class="text-[11px] text-content-muted" [attr.datetime]="entry.changedAt">
                    {{ entry.changedAt | date:'medium' }}
                  </time>
                </div>

                @if (entry.note) {
                   <p class="mt-2 text-sm leading-relaxed text-content-muted">
                    {{ entry.note }}
                  </p>
                }
              </li>
            }
          </ol>
        }
      </div>
    </section>
  `,
})
export class IssueGroupStatusHistoryComponent {
  @Input({ required: true }) statusHistory: StatusHistoryItem[] = [];
  @Input({ required: true }) currentStatus: IssueStatus = 'Pending';

  protected readonly allStatuses = ISSUE_STATUSES;

  protected readonly currentStatusConfig = computed(
    () => STATUS_CONFIG[this.currentStatus] ?? STATUS_CONFIG.Pending
  );

  protected readonly currentStepIndex = computed(() => {
    const idx = this.allStatuses.indexOf(this.currentStatus);
    return idx >= 0 ? idx : 0;
  });

  protected readonly progressPercentage = computed(() => {
    const totalSteps = this.allStatuses.length - 1;
    return (this.currentStepIndex() / totalSteps) * 100;
  });

  protected isStepCompleted(index: number): boolean {
    return index < this.currentStepIndex();
  }

  protected isStepCurrent(index: number): boolean {
    return index === this.currentStepIndex();
  }

  protected getStatusConfig(status: IssueStatus) {
    return STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  }

  protected getStatusLabel(status: IssueStatus): string {
    return STATUS_CONFIG[status]?.label ?? status;
  }

  protected getStepIndicatorClass(status: IssueStatus, index: number): string {
    if (this.isStepCompleted(index)) {
      return 'border-emerald-500 bg-emerald-500 text-white';
    }
    if (this.isStepCurrent(index)) {
      return 'border-sky-500 bg-white text-sky-700 dark:bg-slate-900 dark:text-sky-300';
    }
    return 'border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500';
  }

  protected getStepLabelClass(status: IssueStatus, index: number): string {
    if (this.isStepCurrent(index)) {
      return 'text-slate-900 dark:text-slate-100';
    }
    if (this.isStepCompleted(index)) {
      return 'text-emerald-700 dark:text-emerald-400';
    }
    return 'text-slate-400 dark:text-slate-500';
  }
}
