import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CATEGORY_CONFIG,
  ISSUE_CATEGORIES,
  IssueCategory,
} from '../../../../features/issue-groups/models/issue-group.model';
import { IssueIconComponent } from '../../../../shared/components/issue-icon/issue-icon.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [RouterLink, IssueIconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="border-y border-line bg-background-alt py-16 sm:py-24"
      aria-labelledby="categories-heading"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" appReveal>
          <div class="max-w-2xl">
            <p class="section-eyebrow">What you can report</p>
            <h2 id="categories-heading" class="section-title mt-4">
              Issue categories
            </h2>
            <p class="section-subtitle">
              Every report is filed under one of the categories the CityPulse
              engine uses to cluster and prioritise problems.
            </p>
          </div>

          <a
            routerLink="/reports"
            class="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Report an issue &rarr;
          </a>
        </div>

        <ul class="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          @for (category of categories; track category; let i = $index) {
            <li appReveal="scale" [revealDelay]="i * 60">
              <a
                routerLink="/reports"
                class="group flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span
                  [class]="
                    'inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ' +
                    config[category].bgClass
                  "
                >
                  <app-issue-icon
                    [name]="config[category].icon"
                    [class]="'h-5 w-5 ' + config[category].colorClass"
                  />
                </span>
                <span class="text-sm font-semibold text-content">
                  {{ config[category].label }}
                </span>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class CategoriesSectionComponent {
  /** Reused from the existing issue-groups model — not redeclared here. */
  protected readonly categories: readonly IssueCategory[] = ISSUE_CATEGORIES;
  protected readonly config = CATEGORY_CONFIG;
}
