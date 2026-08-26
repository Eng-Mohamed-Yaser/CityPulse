import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  IssueSeverity,
  IssueStatus,
} from '../../models/issue-group.model';

export type FormMode = 'status' | 'severity';

@Component({
  selector: 'app-issue-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/80">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            @if (mode === 'status') {
              Update status
            } @else {
              Escalate severity
            }
          </h3>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            @if (mode === 'status') {
              Transition workflow state with an optional audit note.
            } @else {
              Increase severity (backend rejects downgrades).
            }
          </p>
        </div>
        <button
          type="button"
          (click)="onCancel()"
          class="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close form"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      @if (mode === 'status') {
        <form [formGroup]="statusForm" (ngSubmit)="onStatusSubmit()" class="mt-4 space-y-4">
          <div>
            <label for="status-select" class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Target status <span class="text-red-500">*</span>
            </label>
            <select
              id="status-select"
              formControlName="status"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            >
              @for (st of allStatuses; track st) {
                <option [value]="st" [disabled]="st === currentStatus">
                  {{ st }} {{ st === currentStatus ? '(current)' : '' }}
                </option>
              }
            </select>
            @if (statusForm.get('status')?.invalid && statusForm.get('status')?.touched) {
              <p class="mt-1 text-xs text-red-600 dark:text-red-400">Please select a valid target status.</p>
            }
          </div>

          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label for="status-note" class="text-xs font-medium text-slate-600 dark:text-slate-400">
                Audit note <span class="font-normal text-slate-400">(optional)</span>
              </label>
              <span class="text-[11px] text-slate-400">
                {{ statusForm.get('note')?.value?.length || 0 }}/500
              </span>
            </div>
            <textarea
              id="status-note"
              formControlName="note"
              rows="3"
              placeholder="Context, inspector notes, or assignment details…"
              class="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            ></textarea>
            @if (statusForm.get('note')?.hasError('maxlength')) {
              <p class="mt-1 text-xs text-red-600 dark:text-red-400">Note cannot exceed 500 characters.</p>
            }
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isLoading"
              class="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="statusForm.invalid || isLoading || statusForm.get('status')?.value === currentStatus"
              class="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
            >
              @if (isLoading) {
                <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Updating…
              } @else {
                Confirm status update
              }
            </button>
          </div>
        </form>
      }

      @if (mode === 'severity') {
        <form [formGroup]="severityForm" (ngSubmit)="onSeveritySubmit()" class="mt-4 space-y-4">
          <div>
            <label for="severity-select" class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Target severity <span class="text-red-500">*</span>
            </label>
            <select
              id="severity-select"
              formControlName="severity"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            >
              @for (sev of allSeverities; track sev) {
                <option [value]="sev" [disabled]="sev === currentSeverity">
                  {{ sev }} {{ sev === currentSeverity ? '(current)' : '' }}
                </option>
              }
            </select>
          </div>

          <div class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
            Severity can only be escalated (Low → Medium → High → Critical). Downgrades are rejected by the backend.
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isLoading"
              class="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="severityForm.invalid || isLoading || severityForm.get('severity')?.value === currentSeverity"
              class="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
            >
              @if (isLoading) {
                <svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Escalating…
              } @else {
                Escalate severity
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class IssueGroupFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() mode: FormMode = 'status';
  @Input() currentStatus: IssueStatus = 'Pending';
  @Input() currentSeverity: IssueSeverity = 'Low';
  @Input() isLoading = false;

  @Output() statusSubmit = new EventEmitter<{ status: IssueStatus; note?: string | null }>();
  @Output() severitySubmit = new EventEmitter<IssueSeverity>();
  @Output() formCancel = new EventEmitter<void>();

  protected readonly allStatuses = ISSUE_STATUSES;
  protected readonly allSeverities = ISSUE_SEVERITIES;

  protected statusForm!: FormGroup;
  protected severityForm!: FormGroup;

  ngOnInit(): void {
    const nextStatus = this.calculateNextSuggestedStatus();

    this.statusForm = this.fb.group({
      status: [nextStatus || this.currentStatus, [Validators.required]],
      note: ['', [Validators.maxLength(500)]],
    });

    this.severityForm = this.fb.group({
      severity: [this.currentSeverity, [Validators.required]],
    });
  }

  private calculateNextSuggestedStatus(): IssueStatus {
    const transitions: Record<IssueStatus, IssueStatus | null> = {
      Pending: 'InReview',
      InReview: 'InProgress',
      InProgress: 'Resolved',
      Resolved: null,
    };
    return transitions[this.currentStatus] ?? this.currentStatus;
  }

  protected onStatusSubmit(): void {
    if (this.statusForm.valid) {
      const { status, note } = this.statusForm.value;
      this.statusSubmit.emit({
        status,
        note: note ? note.trim() : null,
      });
    }
  }

  protected onSeveritySubmit(): void {
    if (this.severityForm.valid) {
      const { severity } = this.severityForm.value;
      this.severitySubmit.emit(severity);
    }
  }

  protected onCancel(): void {
    this.formCancel.emit();
  }
}
