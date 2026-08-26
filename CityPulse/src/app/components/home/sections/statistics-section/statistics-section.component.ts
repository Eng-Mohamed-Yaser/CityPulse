import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

/**
 * `value: null` renders a placeholder dash.
 *
 * Deliberately NOT populated with invented numbers. The server does expose
 * `GET /api/dashboard/summary`, but that route requires `authenticate` +
 * `authorize('Admin')` (see CityPulse-Server/src/routes/dashboard.routes.ts),
 * so it cannot back a public landing page. When a public metrics endpoint
 * exists, only `value` needs to be fed from it — the markup stays unchanged.
 */
interface CommunityStat {
  readonly label: string;
  readonly description: string;
  readonly value: number | null;
}

@Component({
  selector: 'app-statistics-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-background py-16 sm:py-24" aria-labelledby="stats-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl" appReveal>
          <p class="section-eyebrow">Community impact</p>
          <h2 id="stats-heading" class="section-title mt-4">
            Built to show real municipal progress
          </h2>
          <p class="section-subtitle">
            These counters read from your city's own CityPulse deployment.
          </p>
        </div>

        <dl class="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          @for (stat of stats; track stat.label; let i = $index) {
            <div appReveal [revealDelay]="i * 70" class="bg-surface px-5 py-6 sm:px-6 sm:py-7">
              <dt class="text-xs font-semibold uppercase tracking-wider text-content-subtle">
                {{ stat.label }}
              </dt>
              <dd
                class="mt-2 font-display text-3xl font-extrabold tabular-nums tracking-tight text-content sm:text-4xl"
              >
                @if (stat.value === null) {
                  <span aria-hidden="true">&mdash;</span>
                  <span class="sr-only">Not yet published</span>
                } @else {
                  {{ stat.value }}
                }
              </dd>
              <p class="mt-1.5 text-xs leading-relaxed text-content-muted">
                {{ stat.description }}
              </p>
            </div>
          }
        </dl>

        <p class="mt-4 flex items-start gap-2 text-xs text-content-subtle">
          <svg
            class="mt-0.5 h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.25 11.25h1.5v5h-1.5v-5Zm.75-4.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span>
            Public community totals are not exposed by the API yet, so no figures
            are shown here. The existing dashboard summary endpoint is restricted
            to administrators.
          </span>
        </p>
      </div>
    </section>
  `,
})
export class StatisticsSectionComponent {
  protected readonly stats: readonly CommunityStat[] = [
    {
      label: 'Total reports',
      description: 'Citizen submissions received across all categories.',
      value: null,
    },
    {
      label: 'Active issues',
      description: 'Groups currently pending, in review or in progress.',
      value: null,
    },
    {
      label: 'Resolved issues',
      description: 'Problems inspected and closed by municipal teams.',
      value: null,
    },
    {
      label: 'Community members',
      description: 'Residents contributing reports in your city.',
      value: null,
    },
  ];
}
