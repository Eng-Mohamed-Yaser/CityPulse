import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
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

/** Lifecycle of the automatic geolocation lookup that runs when the page opens. */
type LocationStatus = 'idle' | 'locating' | 'ready' | 'error';

interface DetectedLocation {
  readonly longitude: number;
  readonly latitude: number;
  /** Radius of uncertainty in metres, when the device reports one. */
  readonly accuracy: number | null;
}

const MISSING_LOCATION_MESSAGE =
  'This report still needs a location. Allow location access and retry the detection, or enter the coordinates manually.';

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
          <section class="glass-panel rounded-2xl border-success/30 p-6 sm:p-8" role="status" aria-live="polite" aria-labelledby="success-heading">
            <div class="flex items-start gap-4">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
                </svg>
              </span>
              <div class="min-w-0">
                <h2 id="success-heading" class="font-display text-xl font-bold text-content">Report added successfully</h2>
                <p class="mt-1 text-sm text-content-muted">Your report was added successfully and is now being processed.</p>
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
            <div class="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger" role="alert" aria-live="assertive">
              <div class="flex items-start gap-3 text-sm">
              <svg class="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
                <div>
                  <p class="font-semibold">Report could not be added</p>
                  <p class="mt-1 text-danger/80">{{ errorMessage() }}</p>
                </div>
              </div>
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
                  <p class="mt-1 text-sm text-content-muted">CityPulse detects where you are automatically, so your report is grouped with nearby ones about the same issue.</p>
                </div>
              </div>

              <div class="mt-6" aria-live="polite">
                @switch (locationStatus()) {
                  @case ('locating') {
                    <div class="flex items-center gap-3 rounded-xl border border-line bg-background-alt px-4 py-3.5 text-sm text-content-muted">
                      <svg class="h-4 w-4 shrink-0 animate-spin text-primary" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" /></svg>
                      <span>Detecting your location&hellip; allow location access if your browser asks.</span>
                    </div>
                  }
                  @case ('ready') {
                    <div class="rounded-xl border border-success/30 bg-success/10 px-4 py-4">
                      <div class="flex flex-wrap items-start justify-between gap-4">
                        <div class="flex min-w-0 items-start gap-3">
                          <svg class="mt-0.5 h-5 w-5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                          </svg>
                          <div class="min-w-0">
                            <p class="text-sm font-semibold text-content">Location detected automatically</p>
                            <p class="mt-1 break-all font-mono text-xs text-content-muted">{{ coordinatesLabel() }}</p>
                            @if (accuracyLabel(); as accuracy) {
                              <p class="mt-1 text-xs text-content-subtle">{{ accuracy }}</p>
                            }
                          </div>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                          @if (mapUrl(); as url) {
                            <a [href]="url" target="_blank" rel="noopener noreferrer" class="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-content transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">View on map</a>
                          }
                          <button type="button" (click)="detectLocation()" class="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-content transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Refresh</button>
                        </div>
                      </div>
                    </div>
                  }
                  @case ('error') {
                    <div class="rounded-xl border border-warning/40 bg-warning/10 px-4 py-4">
                      <div class="flex items-start gap-3">
                        <svg class="mt-0.5 h-5 w-5 shrink-0 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008Zm9-3.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <div class="min-w-0">
                          <p class="text-sm font-semibold text-content">Automatic location unavailable</p>
                          <p class="mt-1 text-sm text-content-muted">{{ locationMessage() }}</p>
                          <button type="button" (click)="detectLocation()" class="mt-3 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-content transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Retry detection</button>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>

              @if (showManualLocation()) {
                <div class="mt-5 border-t border-line pt-5">
                  <p class="text-xs text-content-subtle">Manual fallback &mdash; coordinates are sent as GeoJSON order: longitude, then latitude.</p>
                  <div class="mt-4 grid gap-5 sm:grid-cols-2">
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
                </div>
              } @else if (locationStatus() === 'ready') {
                <button type="button" (click)="enableManualLocation()" class="mt-4 rounded text-xs font-semibold text-primary underline decoration-dotted underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  Location looks wrong? Enter coordinates manually
                </button>
              }
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
export class ReportsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reports = inject(ReportService);

  protected readonly categories: readonly IssueCategory[] = ISSUE_CATEGORIES;
  protected readonly severities: readonly IssueSeverity[] = ISSUE_SEVERITIES;
  protected readonly categoryConfig = CATEGORY_CONFIG;
  protected readonly severityConfig = SEVERITY_CONFIG;
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly locationMessage = signal<string | null>(null);
  protected readonly locationStatus = signal<LocationStatus>('idle');
  protected readonly detectedLocation = signal<DetectedLocation | null>(null);
  /** Manual coordinate inputs are a fallback: hidden until detection fails or the user opts in. */
  protected readonly showManualLocation = signal(false);
  protected readonly successReport = signal<import('../../models/report.model').ReportRecord | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly isDragging = signal(false);

  protected readonly coordinatesLabel = computed(() => {
    const location = this.detectedLocation();
    if (!location) {
      return '';
    }

    return `Lat ${location.latitude.toFixed(6)} · Lon ${location.longitude.toFixed(6)}`;
  });

  protected readonly accuracyLabel = computed(() => {
    const accuracy = this.detectedLocation()?.accuracy;
    return typeof accuracy === 'number' ? `Accurate to about ${Math.round(accuracy)} m` : null;
  });

  protected readonly mapUrl = computed(() => {
    const location = this.detectedLocation();
    if (!location) {
      return null;
    }

    const { latitude, longitude } = location;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
  });

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, trimmedLength(5, 100)]],
    description: ['', [Validators.required, trimmedLength(15, 1000)]],
    category: ['' as IssueCategory | '', Validators.required],
    severity: ['' as IssueSeverity | '', Validators.required],
    longitude: ['', [Validators.required, coordinate(-180, 180)]],
    latitude: ['', [Validators.required, coordinate(-90, 90)]],
  });

  ngOnInit(): void {
    this.detectLocation();
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

  /**
   * Runs automatically on page load, and again on "Refresh" / "Retry detection".
   * Writes straight into the coordinate controls so the user never types them.
   */
  protected detectLocation(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.failLocation('This browser cannot detect your location automatically.');
      return;
    }

    this.locationMessage.set(null);
    this.locationStatus.set('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => this.applyLocation(position.coords),
      (error) => this.failLocation(this.geolocationMessage(error)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  /** Reveals the manual coordinate inputs when the detected position is not usable. */
  protected enableManualLocation(): void {
    this.showManualLocation.set(true);
  }

  private applyLocation(coords: GeolocationCoordinates): void {
    const { longitude, latitude, accuracy } = coords;

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      this.failLocation('Your device returned an invalid position.');
      return;
    }

    this.form.controls.longitude.setValue(longitude.toFixed(6));
    this.form.controls.latitude.setValue(latitude.toFixed(6));
    this.form.controls.longitude.markAsDirty();
    this.form.controls.latitude.markAsDirty();

    this.detectedLocation.set({
      longitude,
      latitude,
      accuracy: Number.isFinite(accuracy) ? accuracy : null,
    });
    this.locationMessage.set(null);
    this.locationStatus.set('ready');

    if (this.errorMessage() === MISSING_LOCATION_MESSAGE) {
      this.errorMessage.set(null);
    }
  }

  private failLocation(message: string): void {
    this.detectedLocation.set(null);
    this.locationMessage.set(message);
    this.locationStatus.set('error');
    this.showManualLocation.set(true);
  }

  private geolocationMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access is blocked. Allow it for this site in your browser settings and retry, or enter the coordinates below.';
      case error.POSITION_UNAVAILABLE:
        return 'Your device could not work out a position right now. Retry, or enter the coordinates below.';
      case error.TIMEOUT:
        return 'Locating you took too long. Retry, or enter the coordinates below.';
      default:
        return 'We could not detect your location. Retry, or enter the coordinates below.';
    }
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
    // Coordinates are normally invisible, so a missing position needs its own message
    // and must reveal the manual fallback instead of silently blocking the submit.
    if (this.form.controls.longitude.invalid || this.form.controls.latitude.invalid) {
      this.showManualLocation.set(true);
      this.form.markAllAsTouched();
      this.errorMessage.set(MISSING_LOCATION_MESSAGE);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please correct the highlighted fields before adding your report.');
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
        this.errorMessage.set(null);
        this.successReport.set(response.data);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.successReport.set(null);
        this.errorMessage.set(`The report was not added. ${this.apiMessage(error)}`);
      },
    });
  }

  protected startAnother(): void {
    this.successReport.set(null);
    this.errorMessage.set(null);
    this.previewUrl.set(null);
    this.locationMessage.set(null);
    this.detectedLocation.set(null);
    this.showManualLocation.set(false);
    this.locationStatus.set('idle');
    this.form.reset({ title: '', description: '', category: '', severity: '', longitude: '', latitude: '' });
    this.detectLocation();
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
