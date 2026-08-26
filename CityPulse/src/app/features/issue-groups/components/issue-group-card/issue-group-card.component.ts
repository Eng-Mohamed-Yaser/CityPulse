import { Component, Input, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CATEGORY_CONFIG,
  IssueGroup,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from '../../models/issue-group.model';

@Component({
  selector: 'app-issue-group-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  template: `
    <article
      class="glass-card group flex h-full flex-col rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div
             class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
            [ngClass]="categoryConfig().bgClass + ' ' + categoryConfig().colorClass"
            aria-hidden="true"
          >
            @switch (group.category) {
              @case ('Pothole') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <circle cx="12" cy="12" r="9" stroke-dasharray="3 3" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                </svg>
              }
              @case ('Streetlight') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              @case ('WaterLeak') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
              @case ('Garbage') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
              @case ('RoadDamage') {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              @default {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            }
          </div>
          <div class="min-w-0">
             <h3 class="truncate text-sm font-semibold text-content">
              {{ categoryConfig().label }}
            </h3>
             <p class="font-mono text-[11px] text-content-subtle">
              #{{ group._id.slice(-6).toUpperCase() }}
            </p>
          </div>
        </div>

        <span
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
          [ngClass]="severityConfig().badgeClass"
        >
          <span class="h-1.5 w-1.5 rounded-full" [ngClass]="severityConfig().indicatorClass"></span>
          {{ severityConfig().label }}
        </span>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium"
          [ngClass]="statusConfig().badgeClass"
        >
          <span class="h-1.5 w-1.5 rounded-full" [ngClass]="statusConfig().indicatorClass"></span>
          {{ statusConfig().label }}
        </span>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4">
        <div>
           <p class="metric-label">
            Priority
          </p>
           <p class="mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight text-content">
             {{ group.priorityScore | number:'1.0-1' }}
          </p>
             <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-alt">
            <div
              class="h-full rounded-full transition-[width] duration-300"
              [style.width.%]="priorityPercent()"
              [ngClass]="severityConfig().indicatorClass"
            ></div>
          </div>
        </div>
        <div>
           <p class="metric-label">
            Reports
          </p>
           <p class="mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight text-content">
            {{ group.reportCount }}
          </p>
           <p class="mt-2 text-[11px] text-content-subtle">Citizen reports</p>
        </div>
      </div>

       <div class="mt-5 flex items-center gap-1.5 text-xs text-content-muted">
         <svg class="h-3.5 w-3.5 shrink-0 text-content-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
         <span class="font-mono text-[11px] text-content-muted">
          {{ group.centerLocation.coordinates[1] | number:'1.4-4' }},
          {{ group.centerLocation.coordinates[0] | number:'1.4-4' }}
        </span>
      </div>

       <div class="mt-auto flex items-center justify-between border-t border-line pt-4">
         <time class="text-[11px] text-content-subtle" [attr.datetime]="group.updatedAt">
          Updated {{ group.updatedAt | date:'mediumDate' }}
        </time>
        <a
          [routerLink]="['/admin/issue-groups', group._id]"
          class="inline-flex items-center gap-1 text-sm font-medium text-sky-700 transition-colors hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
        >
          View details
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  `,
})
export class IssueGroupCardComponent {
  @Input({ required: true }) group!: IssueGroup;

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
}
