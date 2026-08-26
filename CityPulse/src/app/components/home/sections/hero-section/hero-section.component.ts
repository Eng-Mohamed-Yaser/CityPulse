import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="relative isolate overflow-hidden border-b border-line bg-background"
      aria-labelledby="hero-heading"
    >
      <!-- Layered backdrop: soft primary bloom + faint street grid -->
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
        <div
          class="absolute -top-32 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[130px]"
        ></div>
        <div
          class="absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-[120px]"
        ></div>
        <div class="absolute inset-0 opacity-[0.35] dark:opacity-25" [style.background-image]="gridImage" [style.background-size]="'40px 40px'"></div>
      </div>

      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Copy column -->
          <div appReveal>
            <p class="section-eyebrow">
              <span class="relative flex h-1.5 w-1.5">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
                ></span>
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
              </span>
              Civic intelligence platform
            </p>

            <h1
              id="hero-heading"
              class="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-content sm:text-5xl lg:text-6xl"
            >
              Report. Connect.
              <span class="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Improve Your City.
              </span>
            </h1>

            <p class="mt-5 max-w-xl text-base leading-relaxed text-content-muted sm:text-lg">
              Allow citizens to report local problems, discover community issues,
              and help authorities understand what needs attention.
            </p>

            @if (isAdmin()) {
              <!-- Issue-group search is administrative data, so citizens never see it. -->
              <form
                (ngSubmit)="search(queryInput.value)"
                (submit)="$event.preventDefault()"
                class="mt-8 max-w-xl"
                role="search"
              >
              <label for="hero-search" class="mb-2 block text-sm font-medium text-content">
                Search your city
              </label>
              <div class="flex flex-col gap-2.5 sm:flex-row">
                <div class="relative flex-1">
                  <svg
                    class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                    />
                  </svg>
                  <input
                    #queryInput
                    id="hero-search"
                    name="search"
                    type="search"
                    placeholder="Search issues, locations, categories…"
                    class="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-3.5 text-sm text-content shadow-sm transition-colors placeholder:text-content-subtle focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                  />
                </div>
                <button type="submit" class="btn-primary shrink-0">Search</button>
              </div>
              <p class="mt-2 text-xs text-content-subtle">
                Searches the issue groups already loaded from your city's feed.
              </p>
              </form>
            }

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a routerLink="/reports" class="btn-primary">
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
              <a routerLink="/reports/mine" class="btn-secondary">
                Track My Reports
                <svg
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Visual column: abstract urban map with clustered issue markers -->
          <div appReveal="scale" [revealDelay]="120" class="relative">
            <div class="glass-card rounded-3xl p-4 sm:p-5">
              <div
                class="mb-3.5 flex items-center justify-between border-b border-line pb-3"
              >
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-success"></span>
                  <span class="text-xs font-semibold text-content">Live city feed</span>
                </div>
                <span class="font-mono text-[10px] uppercase tracking-wider text-content-subtle">
                  Sector 4
                </span>
              </div>

              <!-- Street grid + markers. Decorative, hence aria-hidden. -->
              <svg
                viewBox="0 0 400 260"
                class="h-auto w-full rounded-2xl bg-surface-muted"
                aria-hidden="true"
              >
                <g stroke="currentColor" class="text-line" stroke-width="1.5">
                  <path d="M0 60h400M0 130h400M0 200h400" />
                  <path d="M70 0v260M170 0v260M280 0v260" />
                </g>
                <g stroke="currentColor" class="text-line-strong" stroke-width="3" opacity="0.7">
                  <path d="M0 130h400" />
                  <path d="M170 0v260" />
                </g>

                <!-- Cluster: three reports resolving to one group -->
                <g class="text-primary">
                  <circle cx="170" cy="130" r="34" fill="currentColor" opacity="0.10" />
                  <circle cx="170" cy="130" r="20" fill="currentColor" opacity="0.18" />
                  <circle cx="156" cy="120" r="4.5" fill="currentColor" />
                  <circle cx="182" cy="126" r="4.5" fill="currentColor" />
                  <circle cx="168" cy="143" r="4.5" fill="currentColor" />
                </g>

                <g class="text-warning">
                  <circle cx="292" cy="70" r="18" fill="currentColor" opacity="0.14" />
                  <circle cx="292" cy="70" r="4.5" fill="currentColor" />
                </g>
                <g class="text-accent">
                  <circle cx="62" cy="196" r="18" fill="currentColor" opacity="0.14" />
                  <circle cx="62" cy="196" r="4.5" fill="currentColor" />
                </g>
              </svg>

              <!-- Cluster callout -->
              <div class="mt-3.5 rounded-2xl border border-line bg-surface p-3.5">
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-content">
                      Water main leak
                    </p>
                    <p class="mt-0.5 text-xs text-content-muted">
                      3 citizen reports grouped
                    </p>
                  </div>
                  <span
                    class="shrink-0 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning"
                  >
                    High
                  </span>
                </div>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-background-alt">
                  <div class="h-full w-2/3 rounded-full bg-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroSectionComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = this.auth.isAdmin;

  /** Faint street-grid overlay, kept in TS so the colour follows the theme. */
  protected readonly gridImage =
    'linear-gradient(to right, rgb(100 116 139 / 0.12) 1px, transparent 1px),' +
    'linear-gradient(to bottom, rgb(100 116 139 / 0.12) 1px, transparent 1px)';

  /**
   * Hands the term to the existing client-side search on the issue-groups page
   * via a query param. No new endpoint is involved.
   *
   * Uses a template ref rather than Reactive Forms deliberately: this is the
   * eagerly-loaded landing route, and pulling @angular/forms in for one
   * uncontrolled input measurably inflates the initial bundle.
   */
  protected search(rawQuery: string): void {
    const query = rawQuery.trim();

    void this.router.navigate(['/admin/issue-groups'], {
      queryParams: query ? { search: query } : {},
    });
  }
}
