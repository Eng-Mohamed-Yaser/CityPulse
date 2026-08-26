import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="about" class="bg-background py-16 sm:py-24" aria-labelledby="about-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div appReveal>
            <p class="section-eyebrow">About</p>
            <h2 id="about-heading" class="section-title mt-4">
              Civic infrastructure, made legible
            </h2>
          </div>

          <div appReveal [revealDelay]="90" class="space-y-5">
            <p class="text-base leading-relaxed text-content-muted">
              CityPulse is a civic-tech platform that turns scattered citizen
              reports into a clear picture of what a city needs to fix. Residents
              report the problems they encounter; the platform clusters those
              reports by location and category so that municipal teams work from
              one record per real-world problem.
            </p>
            <p class="text-base leading-relaxed text-content-muted">
              The result is less duplicated effort for city staff, and a
              transparent status trail for the people who reported the issue in
              the first place.
            </p>

            <dl class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              @for (value of values; track value.title) {
                <div class="rounded-xl border border-line bg-surface p-4">
                  <dt class="text-sm font-semibold text-content">{{ value.title }}</dt>
                  <dd class="mt-1 text-xs leading-relaxed text-content-muted">
                    {{ value.description }}
                  </dd>
                </div>
              }
            </dl>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutSectionComponent {
  protected readonly values = [
    {
      title: 'Transparent',
      description: 'Every status change is recorded and visible to reporters.',
    },
    {
      title: 'Accountable',
      description: 'One group per problem means nothing quietly disappears.',
    },
    {
      title: 'Community-first',
      description: 'Report volume shapes how severity and priority are judged.',
    },
  ] as const;
}
