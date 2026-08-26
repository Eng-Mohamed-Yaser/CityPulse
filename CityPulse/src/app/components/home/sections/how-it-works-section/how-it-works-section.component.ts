import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ISSUE_STATUSES,
  STATUS_CONFIG,
  IssueStatus,
} from '../../../../features/issue-groups/models/issue-group.model';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface ProcessStep {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly iconPath: string;
}

@Component({
  selector: 'app-how-it-works-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-background py-16 sm:py-24" aria-labelledby="how-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <p class="section-eyebrow">Three steps</p>
          <h2 id="how-heading" class="section-title mt-4">How it works</h2>
          <p class="section-subtitle">
            From submission to resolution, every report follows the same
            transparent path.
          </p>
        </div>

        <!-- Horizontal timeline on desktop, vertical on mobile -->
        <ol class="relative mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
          <!-- Desktop connecting rail -->
          <div
            aria-hidden="true"
            class="absolute left-6 top-0 hidden h-full w-px bg-line sm:block lg:left-0 lg:top-6 lg:h-px lg:w-full"
          ></div>

          @for (step of steps; track step.number; let i = $index) {
            <li appReveal [revealDelay]="i * 110" class="relative pl-16 sm:pl-20 lg:pl-0">
              <span
                class="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface font-display text-sm font-extrabold text-primary shadow-sm lg:relative lg:mb-5"
              >
                {{ step.number }}
              </span>

              <div class="lg:pr-6">
                <div class="flex items-center gap-2.5">
                  <svg
                    class="h-4 w-4 shrink-0 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.9"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path [attr.d]="step.iconPath" />
                  </svg>
                  <h3 class="font-display text-lg font-bold tracking-tight text-content">
                    {{ step.title }}
                  </h3>
                </div>
                <p class="mt-2.5 text-sm leading-relaxed text-content-muted">
                  {{ step.description }}
                </p>
              </div>
            </li>
          }
        </ol>

        <!-- Status pipeline, driven by the real STATUS_CONFIG -->
        <div class="mt-14 rounded-2xl border border-line bg-surface p-6 sm:p-8" appReveal>
          <h3 class="font-display text-sm font-bold uppercase tracking-wider text-content-subtle">
            Status pipeline
          </h3>

          <ol class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            @for (status of statuses; track status; let last = $last) {
              <li class="flex flex-1 items-center gap-3">
                <div class="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    [class]="'h-2.5 w-2.5 shrink-0 rounded-full ' + config[status].indicatorClass"
                  ></span>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-content">
                      {{ config[status].label }}
                    </p>
                    <p class="mt-0.5 text-xs leading-snug text-content-muted">
                      {{ config[status].description }}
                    </p>
                  </div>
                </div>

                @if (!last) {
                  <svg
                    class="hidden h-4 w-4 shrink-0 rotate-90 text-content-subtle sm:block sm:rotate-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                }
              </li>
            }
          </ol>
        </div>
      </div>
    </section>
  `,
})
export class HowItWorksSectionComponent {
  /** Reused from the existing issue-groups model. */
  protected readonly statuses: readonly IssueStatus[] = ISSUE_STATUSES;
  protected readonly config = STATUS_CONFIG;

  protected readonly steps: readonly ProcessStep[] = [
    {
      number: '01',
      title: 'Report',
      description:
        'Submit a problem with a description, category, location and an optional photo.',
      iconPath: 'M12 9v6m3-3H9m9.5 8.5H5.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2Z',
    },
    {
      number: '02',
      title: 'Connect',
      description:
        'CityPulse identifies related reports nearby and groups them around the same real-world issue.',
      iconPath: 'M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9.5 6.5l6 3.5m-6 7 6-3.5',
    },
    {
      number: '03',
      title: 'Resolve',
      description:
        'Track the issue as municipal teams move it toward resolution, with every status change recorded.',
      iconPath: 'm5 13 4 4L19 7',
    },
  ];
}
