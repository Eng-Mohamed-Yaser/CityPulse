import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ISSUE_CATEGORIES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
} from '../../models/issue-group.model';
import { IssueGroupFilters } from '../../models/issue-group-filter.model';

@Component({
  selector: 'app-issue-group-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section
      class="glass-panel rounded-2xl p-5 sm:p-6"
      aria-label="Issue group filters"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <h2 class="font-display text-base font-bold text-content">Filters</h2>
        @if (hasActiveFilters()) {
          <button
            type="button"
            (click)="onReset()"
            class="text-xs font-semibold text-content-muted transition-colors hover:text-primary"
          >
            Reset all
          </button>
        }
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label for="filter-search" class="field-label text-xs">
            Search
          </label>
          <div class="relative">
            <svg
              class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="filter-search"
              type="search"
              [ngModel]="filters.search || ''"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Category, ID, status…"
              class="field-input mt-0 py-2 pl-9"
            />
          </div>
        </div>

        <div>
          <label for="filter-category" class="field-label text-xs">
            Category
          </label>
          <select
            id="filter-category"
            [ngModel]="filters.category || ''"
            (ngModelChange)="onCategoryChange($event)"
            class="field-input mt-0 py-2"
          >
            <option value="">All categories</option>
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>

        <div>
          <label for="filter-status" class="field-label text-xs">
            Status
          </label>
          <select
            id="filter-status"
            [ngModel]="filters.status || ''"
            (ngModelChange)="onStatusChange($event)"
            class="field-input mt-0 py-2"
          >
            <option value="">All statuses</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
        </div>

        <div>
          <label for="filter-severity" class="field-label text-xs">
            Severity
          </label>
          <select
            id="filter-severity"
            [ngModel]="filters.severity || ''"
            (ngModelChange)="onSeverityChange($event)"
            class="field-input mt-0 py-2"
          >
            <option value="">All severities</option>
            @for (sev of severities; track sev) {
              <option [value]="sev">{{ sev }}</option>
            }
          </select>
        </div>
      </div>

      @if (hasActiveFilters()) {
        <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span class="text-xs font-semibold text-content-subtle">Active filters:</span>
          @if (filters.category) {
            <span class="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary">
              {{ filters.category }}
            </span>
          }
          @if (filters.status) {
            <span class="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary">
              {{ filters.status }}
            </span>
          }
          @if (filters.severity) {
            <span class="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary">
              {{ filters.severity }}
            </span>
          }
          @if (filters.search) {
            <span class="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-semibold text-primary">
              “{{ filters.search }}”
            </span>
          }
        </div>
      }
    </section>
  `,
})
export class IssueGroupFiltersComponent {
  @Input({ required: true }) filters!: IssueGroupFilters;

  @Output() serverFilterChange = new EventEmitter<Partial<IssueGroupFilters>>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() severityChange = new EventEmitter<IssueSeverity | undefined>();
  @Output() reset = new EventEmitter<void>();

  protected readonly categories = ISSUE_CATEGORIES;
  protected readonly statuses = ISSUE_STATUSES;
  protected readonly severities = ISSUE_SEVERITIES;

  protected hasActiveFilters(): boolean {
    return (
      Boolean(this.filters.category) ||
      Boolean(this.filters.status) ||
      Boolean(this.filters.severity) ||
      Boolean(this.filters.search)
    );
  }

  protected onCategoryChange(value: string): void {
    const category = (value || undefined) as IssueCategory | undefined;
    this.serverFilterChange.emit({ category });
  }

  protected onStatusChange(value: string): void {
    const status = (value || undefined) as IssueStatus | undefined;
    this.serverFilterChange.emit({ status });
  }

  protected onSeverityChange(value: string): void {
    const severity = (value || undefined) as IssueSeverity | undefined;
    this.severityChange.emit(severity);
  }

  protected onSearchChange(query: string): void {
    this.searchChange.emit(query);
  }

  protected onReset(): void {
    this.reset.emit();
  }
}
