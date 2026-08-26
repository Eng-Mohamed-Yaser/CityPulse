import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-smart-grouping-section',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="relative isolate overflow-hidden border-y border-line bg-background-alt py-16 sm:py-24"
      aria-labelledby="grouping-heading"
    >
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
        <div
          class="absolute left-1/2 top-1/2 h-[24rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]"
        ></div>
      </div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <p class="section-eyebrow">The CityPulse difference</p>
          <h2 id="grouping-heading" class="section-title mt-4">
            Many reports. One real problem.
          </h2>
          <p class="section-subtitle">
            Ten neighbours reporting the same burst water main is one issue — not
            ten. CityPulse groups reports by location and category so cities see
            the problem, not the noise.
          </p>
        </div>

        <!-- Flow diagram: reports -> group -> city problem -->
        <div class="mt-14" appReveal [revealDelay]="100">
          <div class="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:gap-4">
            <!-- Stage 1: individual reports -->
            <div class="space-y-2.5">
              <p class="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-content-subtle lg:text-left">
                Citizen reports
              </p>
              @for (report of reports; track report.id) {
                <div
                  class="flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-sm"
                >
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background-alt font-mono text-[10px] font-bold text-content-muted"
                  >
                    {{ report.id }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-xs font-semibold text-content">
                      {{ report.label }}
                    </p>
                    <p class="truncate font-mono text-[10px] text-content-subtle">
                      {{ report.coords }}
                    </p>
                  </div>
                </div>
              }
            </div>

            <!-- Connector -->
            <div class="flex justify-center" aria-hidden="true">
              <svg
                class="h-8 w-8 rotate-90 text-primary lg:h-10 lg:w-10 lg:rotate-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </div>

            <!-- Stage 2: the group -->
            <div class="rounded-2xl border-2 border-primary/30 bg-surface p-5 shadow-lg">
              <p class="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-primary">
                Issue group
              </p>
              <div class="text-center">
                <span
                  class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-contrast"
                >
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9.5 6.5l6 3.5m-6 7 6-3.5" />
                  </svg>
                </span>
                <p class="mt-3 font-display text-sm font-bold text-content">
                  Water main leak
                </p>
                <p class="mt-1 text-xs text-content-muted">
                  Grouped within a 50&nbsp;m radius
                </p>
                <div class="mt-3 flex items-center justify-center gap-1.5">
                  <span
                    class="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning"
                  >
                    High
                  </span>
                  <span
                    class="rounded-full border border-line bg-background-alt px-2 py-0.5 text-[10px] font-semibold text-content-muted"
                  >
                    3 reports
                  </span>
                </div>
              </div>
            </div>

            <div class="flex justify-center" aria-hidden="true">
              <svg
                class="h-8 w-8 rotate-90 text-primary lg:h-10 lg:w-10 lg:rotate-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </div>

            <!-- Stage 3: municipal action -->
            <div>
              <p class="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-content-subtle lg:text-left">
                City problem
              </p>
              <div class="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                <ul class="space-y-3">
                  @for (outcome of outcomes; track outcome) {
                    <li class="flex items-start gap-2.5">
                      <svg
                        class="mt-0.5 h-4 w-4 shrink-0 text-success"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.25"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                      <span class="text-xs leading-relaxed text-content-muted">
                        {{ outcome }}
                      </span>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center" appReveal>
          <a routerLink="/" fragment="features" class="btn-secondary">
            Explore the platform
          </a>
        </div>
      </div>
    </section>
  `,
})
export class SmartGroupingSectionComponent {
  protected readonly reports = [
    { id: 'R1', label: 'Water flooding pavement', coords: '30.0550, 31.2450' },
    { id: 'R2', label: 'Burst pipe near market', coords: '30.0551, 31.2452' },
    { id: 'R3', label: 'Road wet for two days', coords: '30.0549, 31.2449' },
  ] as const;

  protected readonly outcomes: readonly string[] = [
    'One work order instead of three duplicates',
    'Severity escalated from report volume',
    'Single status thread every reporter can follow',
  ];
}
