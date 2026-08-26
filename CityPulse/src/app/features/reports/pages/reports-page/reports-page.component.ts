import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../services/report.service';
import {
  CreateReportRequest,
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
  selector: 'app-reports-page',
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
              <li class="text-content" aria-current="page">Report an Issue</li>
            </ol>
          </nav>
          <p class="section-eyebrow">Citizen reporting</p>
          <h1 class="section-title mt-4">Report an Issue</h1>
          <p class="section-subtitle max-w-2xl">
            Help your community by describing a problem clearly. CityPulse will
            group nearby reports around the same real-world issue.
          </p>
        </header>

        @if (successReport(); as report) {
          <section class="glass-panel rounded-2xl p-6 sm:p-8" role="status" aria-labelledby="success-heading">
            <div class="flex items-start gap-4">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
                </svg>
              </span>
              <div class="min-w-0">
                <h2 id="success-heading" class="font-display text-xl font-bold text-content">Report submitted</h2>
                <p class="mt-1 text-sm text-content-muted">Your report has been received and is being processed.</p>
              </div>
            </div>
            <dl class="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wider text-content-subtle">Status</dt>
                <dd class="mt-1 text-sm font-semibold text-content">Pending</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wider text-content-subtle">Report ID</dt>
                <dd class="mt-1 break-all font-mono text-xs text-content-muted">{{ report._id }}</dd>
              </div>
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wider text-content-subtle">Issue group</dt>
                <dd class="mt-1 text-sm font-semibold text-content">{{ groupLabel(report) }}</dd>
              </div>
            </dl>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <a routerLink="/reports/mine" class="btn-primary">Track in My Reports</a>
              <button type="button" (click)="startAnother()" class="btn-secondary">Submit another report</button>
            </div>
          </section>
        } @else {
          @if (errorMessage()) {
            <div class="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
              <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">
            <section class="glass-panel rounded-2xl p-6 sm:p-8" aria-labelledby="basic-heading">
              <div class="flex items-start gap-3">
                <span class="section-number">01</span>
                <div>
                  <h2 id="basic-heading" class="font-display text-xl font-bold text-content">Basic Information</h2>
                  <p class="mt-1 text-sm text-content-muted">Give the issue a useful title and enough context for someone else to understand it.</p>
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
                  <p class="mt-1 text-sm text-content-muted">Coordinates are sent as GeoJSON order: longitude, then latitude.</p>
                </div>
              </div>

              @if (locationMessage()) {
                <p class="mt-5 rounded-xl border border-line bg-background-alt px-4 py-3 text-sm text-content-muted" role="status">{{ locationMessage() }}</p>
              }

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
              <button type="button" (click)="useCurrentLocation()" class="btn-secondary mt-5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2m6.364 1.636-1.414 1.414M21 12h-2m-1.636 6.364-1.414-1.414M12 21v-2m-6.364-1.636 1.414-1.414M3 12h2m1.636-6.364 1.414 1.414M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                Use my current location
              </button>
            </section>

            <section class="glass-panel rounded-2xl p-6 sm:p-8" aria-labelledby="evidence-heading">
              <div class="flex items-start gap-3">
                <span class="section-number">03</span>
                <div>
                  <h2 id="evidence-heading" class="font-display text-xl font-bold text-content">Evidence</h2>
                  <p class="mt-1 text-sm text-content-muted">An image is optional. It is previewed locally; the current API does not expose an upload service.</p>
                </div>
              </div>

              <div class="mt-6">
                <label for="report-image" class="field-label">Upload evidence</label>
                <div class="relative mt-1.5 overflow-hidden rounded-2xl border-2 border-dashed border-line-strong bg-surface-muted p-7 text-center transition-colors hover:border-primary/60" [class.border-primary]="isDragging()" [class.bg-primary-subtle]="isDragging()" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)">
                  <input id="report-image" type="file" accept="image/png,image/jpeg,image/webp" (change)="onFileSelected($event)" class="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0" aria-describedby="image-help" />
                  @if (previewUrl(); as preview) {
                    <div class="relative mx-auto h-56 max-w-xl overflow-hidden rounded-xl border border-line">
                      <img [src]="preview" alt="Selected evidence preview" class="h-full w-full object-cover" />
                      <button type="button" (click)="removeFile($event)" class="absolute right-3 top-3 z-30 rounded-lg bg-danger px-3 py-2 text-xs font-semibold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Remove image</button>
                    </div>
                  } @else {
                    <div class="flex flex-col items-center">
                      <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle text-primary"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
                      <p class="mt-3 text-sm font-semibold text-content">Drag and drop or browse</p>
                      <p id="image-help" class="mt-1 text-xs text-content-subtle">PNG, JPG, WEBP. Optional.</p>
                    </div>
                  }
                </div>
              </div>
            </section>

            <div class="glass-panel flex flex-col-reverse gap-3 rounded-2xl p-4 sm:flex-row sm:justify-end">
              <a routerLink="/" class="btn-secondary">Cancel</a>
              <button type="submit" class="btn-primary min-w-40" [disabled]="isSubmitting()">
                @if (isSubmitting()) {
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" /></svg>
                  Submitting...
                } @else {
                  Submit Report
                }
              </button>
            </div>
          </form>
        }
      </div>
    </main>
  `,
})
export class ReportsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reports = inject(ReportService);

  protected readonly categories: readonly IssueCategory[] = ISSUE_CATEGORIES;
  protected readonly severities: readonly IssueSeverity[] = ISSUE_SEVERITIES;
  protected readonly categoryConfig = CATEGORY_CONFIG;
  protected readonly severityConfig = SEVERITY_CONFIG;
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly locationMessage = signal<string | null>(null);
  protected readonly successReport = signal<import('../../models/report.model').ReportRecord | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly isDragging = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, trimmedLength(5, 100)]],
    description: ['', [Validators.required, trimmedLength(15, 1000)]],
    category: ['' as IssueCategory | '', Validators.required],
    severity: ['' as IssueSeverity | '', Validators.required],
    longitude: ['', [Validators.required, coordinate(-180, 180)]],
    latitude: ['', [Validators.required, coordinate(-90, 90)]],
  });

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

  protected useCurrentLocation(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.locationMessage.set('Location access is not available in this browser. Enter coordinates manually.');
      return;
    }

    this.locationMessage.set('Requesting your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.form.controls.longitude.setValue(String(position.coords.longitude));
        this.form.controls.latitude.setValue(String(position.coords.latitude));
        this.form.controls.longitude.markAsDirty();
        this.form.controls.latitude.markAsDirty();
        this.locationMessage.set('Location selected. Coordinates are ready to submit.');
      },
      () => this.locationMessage.set('We could not access your location. Enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.readImage(file);
    }
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.readImage(file);
    }
  }

  protected removeFile(event: Event): void {
    event.stopPropagation();
    this.previewUrl.set(null);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: CreateReportRequest = {
      title: raw.title.trim(),
      description: raw.description.trim(),
      category: raw.category as IssueCategory,
      severity: raw.severity as IssueSeverity,
      longitude: Number(raw.longitude),
      latitude: Number(raw.latitude),
    };

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.reports.create(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.successReport.set(response.data);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this.apiMessage(error));
      },
    });
  }

  protected startAnother(): void {
    this.successReport.set(null);
    this.previewUrl.set(null);
    this.form.reset({ title: '', description: '', category: '', severity: '', longitude: '', latitude: '' });
  }

  protected groupLabel(report: import('../../models/report.model').ReportRecord): string {
    return report.issueGroupId ? 'Assigned by CityPulse' : 'Processing';
  }

  private readImage(file: File): void {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.errorMessage.set('Please choose a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('Images must be 10 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(String(reader.result));
    reader.readAsDataURL(file);
  }

  private apiMessage(error: HttpErrorResponse): string {
    const body = error.error as { message?: string } | null;
    return body?.message ?? (error.status === 0 ? 'The CityPulse server could not be reached.' : 'Report submission failed. Please try again.');
  }
}
