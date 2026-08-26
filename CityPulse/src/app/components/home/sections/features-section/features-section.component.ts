import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface HomeFeature {
  readonly title: string;
  readonly description: string;
  readonly iconPath: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="features" class="bg-background py-16 sm:py-24" aria-labelledby="features-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl" appReveal>
          <p class="section-eyebrow">Platform capabilities</p>
          <h2 id="features-heading" class="section-title mt-4">
            Everything Your Community Needs
          </h2>
          <p class="section-subtitle">
            From a single citizen report to a tracked municipal resolution —
            CityPulse connects the whole chain.
          </p>
        </div>

        <ul class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (feature of features; track feature.title; let i = $index) {
            <li
              appReveal
              [revealDelay]="i * 80"
              class="group rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span
                class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary transition-transform duration-300 group-hover:scale-110"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.9"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path [attr.d]="feature.iconPath" />
                </svg>
              </span>

              <h3 class="mt-5 font-display text-base font-bold tracking-tight text-content">
                {{ feature.title }}
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-content-muted">
                {{ feature.description }}
              </p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class FeaturesSectionComponent {
  protected readonly features: readonly HomeFeature[] = [
    {
      title: 'Report Issues',
      description:
        'Submit problems such as potholes, broken streetlights, water leaks and garbage in a few taps.',
      iconPath: 'M12 9v4m0 3h.01M10.3 4.3 2.5 18a1.8 1.8 0 0 0 1.6 2.7h15.8a1.8 1.8 0 0 0 1.6-2.7L13.7 4.3a1.8 1.8 0 0 0-3.1 0Z',
    },
    {
      title: 'Discover Community Issues',
      description:
        'See what has already been reported nearby and understand what is happening around your community.',
      iconPath: 'm21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
    },
    {
      title: 'Smart Issue Groups',
      description:
        'Related reports are intelligently grouped around the same real-world problem, removing duplicates.',
      iconPath: 'M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9.5 6.5l6 3.5m-6 7 6-3.5',
    },
    {
      title: 'Track Progress',
      description:
        'Follow every issue from Pending through In Review and In Progress to Resolved.',
      iconPath: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
  ];
}
