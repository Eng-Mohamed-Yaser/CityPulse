import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GeoPoint, IssueCategory } from '../../models/issue-group.model';

@Component({
  selector: 'app-issue-group-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <section class="glass-panel overflow-hidden rounded-2xl">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
         <h2 class="font-display text-base font-bold text-content">Location</h2>
         <p class="mt-1 text-xs text-content-muted">
            Spatial centroid of clustered reports
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="copyCoordinates()"
             class="btn-secondary px-2.5 py-1.5 text-xs"
          >
            @if (copied()) {
              <span class="text-emerald-600 dark:text-emerald-400">Copied</span>
            } @else {
              Copy coordinates
            }
          </button>
          <a
            [href]="osmUrl()"
            target="_blank"
            rel="noopener noreferrer"
             class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-subtle"
          >
            Open map
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

       <div class="grid grid-cols-1 gap-3 border-b border-line px-5 py-3 text-xs sm:grid-cols-2">
        <p>
           <span class="text-content-muted">Latitude</span>
           <span class="ml-2 font-mono font-medium text-content">
            {{ latitude() | number:'1.6-6' }}
          </span>
        </p>
        <p>
           <span class="text-content-muted">Longitude</span>
           <span class="ml-2 font-mono font-medium text-content">
            {{ longitude() | number:'1.6-6' }}
          </span>
        </p>
      </div>

       <div class="relative h-64 w-full bg-background-alt">
        @if (embedUrl()) {
          <iframe
            [src]="embedUrl()"
            class="h-full w-full border-0"
            loading="lazy"
            title="Issue group map location"
          ></iframe>
        } @else {
          <div class="flex h-full items-center justify-center p-6 text-center">
            <div>
              <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p class="mt-3 font-mono text-sm text-slate-700 dark:text-slate-300">
                {{ latitude() }}, {{ longitude() }}
              </p>
            </div>
          </div>
        }
      </div>

       <div class="border-t border-line px-5 py-3 text-xs text-content-muted">
        <p>
          Reports are grouped within a 50m radius by the CityPulse backend.
          The map marker shows the calculated spatial centroid—not frontend clustering.
        </p>
      </div>
    </section>
  `,
})
export class IssueGroupMapComponent {
  @Input({ required: true }) centerLocation!: GeoPoint;
  @Input() category?: IssueCategory;
  @Input() reportCount?: number;

  protected readonly copied = signal<boolean>(false);

  constructor(private readonly sanitizer: DomSanitizer) {}

  protected readonly longitude = computed(
    () => this.centerLocation?.coordinates[0] ?? 0
  );

  protected readonly latitude = computed(
    () => this.centerLocation?.coordinates[1] ?? 0
  );

  protected readonly osmUrl = computed(() => {
    const lat = this.latitude();
    const lon = this.longitude();
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  });

  protected readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const lat = this.latitude();
    const lon = this.longitude();
    if (!lat && !lon) return null;

    const delta = 0.003;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected copyCoordinates(): void {
    const text = `${this.latitude()}, ${this.longitude()}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }
}
