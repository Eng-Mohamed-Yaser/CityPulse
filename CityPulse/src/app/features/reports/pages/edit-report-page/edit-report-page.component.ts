import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReportService } from '../../services/report.service';
import {
  UpdateReportRequest,
  ReportRecord,
} from '../../models/report.model';
import {
  CATEGORY_CONFIG,
  ISSUE_CATEGORIES,
  ISSUE_SEVERITIES,
  IssueCategory,
  IssueSeverity,
  SEVERITY_CONFIG,
} from '../../../issue-groups/models/issue-group.model';

function trimmedLength(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    return value.length >= min && value.length <= max
      ? null
      : { trimmedLength: { min, max, actual: value.length } };
  };
}

function coordinate(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    const parsed = Number(value);
    return value !== '' && Number.isFinite(parsed) && parsed >= min && parsed <= max
      ? null
      : { coordinate: { min, max } };
  };
}

@Component({
  selector: 'app-edit-report-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page-shell bg-background-alt/40">
      <div class="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header class="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div aria-hidden="true" class="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
          <nav aria-label="Breadcrumb" class="mb-5">
            <ol class="flex items-center gap-2 text-sm text-content-muted">
              <li>
                <a routerLink="/" class="font-medium hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Home</a>
              </li>
              <li aria-hidden="true" class="text-content-subtle">/</li>
              <li>
                <a routerLink="/reports/mine" class="font-medium hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">My Reports</a>
              </li>
              <li aria-hidden="true" class="text-content-subtle">/</li>
              <li class="text-content" aria-current="page">Edit Report</li>
            </ol>
          </nav>
          <p class="section-eyebrow">Edit report</p>
          <h1 class="section-title mt-4">Update your report</h1>
          <p class="section-subtitle max-w-2xl">
            Make changes to your report details below.
          </p>
        </header>

        @if (isLoading()) {
          <div class="space-y-5">
            <div class="h-64 animate-pulse rounded-2xl bg-surface-elevated"></div>
            <div class="h-48 animate-pulse rounded-2xl bg-surface-elevated"></div>
          </div>
        } @else if (errorMessage()) {
          <div class="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger" role="alert" aria-live="assertive">
            <div class="flex items-start gap-3 text-sm">
              <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <div>
                <p class="font-semibold">Could not load report</p>
                <p class="mt-1 text-danger/80">{{ errorMessage() }}</p>
              </div>
            </div>
          </div>
        } @else {
          @if (successMessage()) {
            <div class="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-success" role="status" aria-live="polite">
              <div class="flex items-start gap-3 text-sm">
                <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
                </svg>
                <span>{{ successMessage() }}</span>
              </div>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">
            <section class="glass-panel rounded-2xl p-6 sm:p-8" aria-labelledby="basic-heading">
              <div class="flex items-start gap-3">
                <span class="section-number">01</span>
                <div>
                  <h2 id="basic-heading" class="font-display text-xl font-bold text-content">Basic Information</h2>
                  <p class="mt-1 text-sm text-content-muted">Update the title, description, category, or severity of your report.</p>
                </div>
              </div>

              <div class="mt-7 grid gap-5">
                <div>
                  <label for="report-title" class="field-label">Title <span class="text-danger" aria-hidden="true">*</span></label>
                  <input id="report-title" type="text" formControlName="title" autocomplete="off" class="field-input" [attr.aria-invalid]="isInvalid('title')" [attr.aria-describedby]="isInvalid('title') ? 'report-title-error' : null" placeholder="e.g. Large pothole near the central library" />
                  @if (isInvalid('title')) {
                    <p id="report-title-error" class="field-error">Title must be between 5 and 100 characters.</p>
                  }
                </div>

                <div>
                  <div class="flex items-center justify-between gap-3">
                    <label for="report-description" class="field-label">Description <span class="text-danger" aria-hidden="true">*</span></label>
                    <span class="text-xs text-content-subtle">{{ form.controls.description.value.length }} / 1000</span>
                  </div>
                  <textarea id="report-description" rows="5" formControlName="description" class="field-input resize-y" [attr.aria-invalid]="isInvalid('description')" [attr.aria-describedby]="isInvalid('description') ? 'report-description-error' : null" placeholder="What happened? Include landmarks, timing, or anything that helps locate the problem."></textarea>
                  @if (isInvalid('description')) {
                    <p id="report-description-error" class="field-error">Description must be between 15 and 1000 characters.</p>
                  }
                </div>

                <div class="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label for="report-category" class="field-label">Category <span class="text-danger" aria-hidden="true">*</span></label>
                    <select id="report-category" formControlName="category" class="field-input" [attr.aria-invalid]="isInvalid('category')">
                      <option value="">Select a category</option>
                      @for (category of categories; track category) {
                        <option [value]="category">{{ categoryConfig[category].label }}</option>
                      }
                    </select>
                    @if (isInvalid('category')) { <p class="field-error">Choose a category.</p> }
                  </div>

                  <div>
                    <span class="field-label">Severity <span class="text-danger" aria-hidden="true">*</span></span>
                    <div class="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Report severity">
                      @for (severity of severities; track severity) {
                        <label [class]="severityClass(severity)" [attr.title]="severityConfig[severity].label">
                          <input type="radio" formControlName="severity" [value]="severity" class="sr-only" />
                          <span [class]="'h-2.5 w-2.5 rounded-full ' + severityDot(severity)" aria-hidden="true"></span>
                          <span class="text-xs font-semibold">{{ severityConfig[severity].label }}</span>
                        </label>
                      }
                    </div>
                    @if (isInvalid('severity')) { <p class="field-error">Choose a severity.</p> }
                  </div>
                </div>
              </div>
            </section>

            <section class="glass-panel rounded-2xl p-6 sm:p-8" aria-labelledby="location-heading">
              <div class="flex items-start gap-3">
                <span class="section-number">02</span>
                <div>
                  <h2 id="location-heading" class="font-display text-xl font-bold text-content">Location</h2>
                  <p class="mt-1 text-sm text-content-muted">Update the coordinates if needed.</p>
                </div>
              </div>

              <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label for="longitude" class="field-label">Longitude <span class="text-danger" aria-hidden="true">*</span></label>
                  <input id="longitude" type="number" inputmode="decimal" step="any" formControlName="longitude" class="field-input" [attr.aria-invalid]="isInvalid('longitude')" placeholder="e.g. 31.2357" />
                  @if (isInvalid('longitude')) { <p class="field-error">Enter a longitude from -180 to 180.</p> }
                </div>
                <div>
                  <label for="latitude" class="field-label">Latitude <span class="text-danger" aria-hidden="true">*</span></label>
                  <input id="latitude" type="number" inputmode="decimal" step="any" formControlName="latitude" class="field-input" [attr.aria-invalid]="isInvalid('latitude')" placeholder="e.g. 30.0444" />
                  @if (isInvalid('latitude')) { <p class="field-error">Enter a latitude from -90 to 90.</p> }
                </div>
              </div>
            </section>

            <div class="glass-panel flex flex-col-reverse gap-3 rounded-2xl p-4 sm:flex-row sm:justify-end">
              <a routerLink="/reports/mine" class="btn-secondary">Cancel</a>
              <button type="submit" class="btn-primary min-w-40" [disabled]="isSubmitting()">
                @if (isSubmitting()) {
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" /></svg>
                  Saving...
                } @else {
                  Save Changes
                }
              </button>
            </div>
          </form>
        }
      </div>
    </main>
  `,
})
export class EditReportPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reports = inject(ReportService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly categories: readonly IssueCategory[] = ISSUE_CATEGORIES;
  protected readonly severities: readonly IssueSeverity[] = ISSUE_SEVERITIES;
  protected readonly categoryConfig = CATEGORY_CONFIG;
  protected readonly severityConfig = SEVERITY_CONFIG;
  protected readonly isSubmitting = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, trimmedLength(5, 100)]],
    description: ['', [Validators.required, trimmedLength(15, 1000)]],
    category: ['' as IssueCategory | '', Validators.required],
    severity: ['' as IssueSeverity | '', Validators.required],
    longitude: ['', [Validators.required, coordinate(-180, 180)]],
    latitude: ['', [Validators.required, coordinate(-90, 90)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Report ID is missing.');
      this.isLoading.set(false);
      return;
    }

    this.reports.getById(id).subscribe({
      next: (response) => {
        this.populateForm(response.data);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? 'Unable to load the report.');
        this.isLoading.set(false);
      },
    });
  }

  protected isInvalid(control: keyof ReturnType<typeof this.form.getRawValue>): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  protected severityClass(severity: IssueSeverity): string {
    const selected = this.form.controls.severity.value === severity;
    const tone = {
      Low: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      Medium: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      High: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
      Critical: 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
    }[severity];

    return `flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${tone} ${selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface' : 'opacity-75 hover:opacity-100'}`;
  }

  protected severityDot(severity: IssueSeverity): string {
    return {
      Low: 'bg-emerald-500',
      Medium: 'bg-amber-500',
      High: 'bg-orange-500',
      Critical: 'bg-red-500',
    }[severity];
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please correct the highlighted fields before saving.');
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const raw = this.form.getRawValue();
    const request: UpdateReportRequest = {
      title: raw.title.trim(),
      description: raw.description.trim(),
      category: raw.category as IssueCategory,
      severity: raw.severity as IssueSeverity,
      longitude: Number(raw.longitude),
      latitude: Number(raw.latitude),
    };

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.reports.update(id, request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Report updated successfully.');
        setTimeout(() => this.router.navigateByUrl('/reports/mine'), 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(`Failed to update report. ${error.error?.message ?? 'Please try again.'}`);
      },
    });
  }

  private populateForm(report: ReportRecord): void {
    const [longitude, latitude] = report.location.coordinates;
    this.form.patchValue({
      title: report.title,
      description: report.description,
      category: report.category,
      severity: report.severity,
      longitude: String(longitude),
      latitude: String(latitude),
    });
  }
}
