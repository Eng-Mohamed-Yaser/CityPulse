import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReportFormComponent } from '../../../../shared/components/report-form/report-form.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-report-section',
  standalone: true,
  imports: [ReportFormComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="report"
      class="border-y border-line bg-background-alt py-16 sm:py-24"
      aria-labelledby="report-heading"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div appReveal>
            <p class="section-eyebrow">Fast &amp; seamless</p>
            <h2 id="report-heading" class="section-title mt-4">
              Submit an incident report
            </h2>
            <p class="section-subtitle">
              Describe the problem, pick a category and attach a photo. Reports
              near an existing problem are automatically folded into the same
              issue group.
            </p>

            <ul class="mt-8 space-y-4">
              @for (point of points; track point.title) {
                <li class="flex gap-3.5">
                  <span
                    class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path [attr.d]="point.iconPath" />
                    </svg>
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-content">{{ point.title }}</p>
                    <p class="mt-0.5 text-sm leading-relaxed text-content-muted">
                      {{ point.description }}
                    </p>
                  </div>
                </li>
              }
            </ul>
          </div>

          <div appReveal [revealDelay]="120">
            <div class="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
              <app-report-form />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ReportSectionComponent {
  protected readonly points = [
    {
      title: 'Pick the right category',
      description:
        'Categories drive how the backend clusters and prioritises your report.',
      iconPath: 'M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5',
    },
    {
      title: 'Attach a photo',
      description:
        'A picture helps municipal inspectors judge severity before dispatch.',
      iconPath:
        'm2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0L16.5 16.5m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.16 2.16M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z',
    },
    {
      title: 'Follow the status thread',
      description:
        'Every status change is recorded on the group so all reporters stay informed.',
      iconPath: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
  ] as const;
}
