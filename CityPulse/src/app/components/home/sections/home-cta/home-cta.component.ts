import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-home-cta',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-background pb-16 sm:pb-24" aria-labelledby="cta-heading">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          appReveal
          class="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center sm:px-12 sm:py-16"
        >
          <!-- Distinct from the hero: contained panel, denser gradient wash -->
          <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/12"
            ></div>
            <div
              class="absolute -bottom-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]"
            ></div>
          </div>

          <h2
            id="cta-heading"
            class="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-content sm:text-4xl"
          >
            Make Your City Better, One Report at a Time.
          </h2>

          <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-content-muted">
            Report the problems you walk past every day, and help build a more
            responsive community for everyone who lives in it.
          </p>

          <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a routerLink="/reports" class="btn-primary w-full sm:w-auto">
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              Report an Issue
            </a>
            <a routerLink="/reports/mine" class="btn-secondary w-full sm:w-auto">
              Track My Reports
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HomeCtaComponent {}
