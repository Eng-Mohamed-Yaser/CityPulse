import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemePreference, ThemeService } from '../../../core/services/theme.service';

interface ThemeOption {
  readonly value: ThemePreference;
  readonly label: string;
}

/**
 * Segmented light / dark / system theme control.
 *
 * `system` is offered deliberately: ThemeService defaults `preference` to
 * 'system', so a two-state light/dark switch would permanently strand users
 * outside the default with no way back to it.
 *
 * Writes go through ThemeService.setPreference, which persists to localStorage
 * and drives the effect that toggles the `dark` class on <html>.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
      role="group"
      aria-label="Color theme"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          (click)="select(option.value)"
          [attr.aria-pressed]="theme.preference() === option.value"
          [attr.title]="option.label"
          [class]="buttonClass(option.value)"
        >
          @switch (option.value) {
            @case ('light') {
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
                  d="M12 3v1.5m0 15V21m6.364-15.364-1.06 1.06M6.696 17.304l-1.06 1.06M21 12h-1.5m-15 0H3m15.364 6.364-1.06-1.06M6.696 6.696l-1.06-1.06M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            }
            @case ('dark') {
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
                  d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            }
            @case ('system') {
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
                  d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25"
                />
              </svg>
            }
          }
          <span class="sr-only">{{ option.label }}</span>
        </button>
      }
    </div>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);

  protected readonly options: readonly ThemeOption[] = [
    { value: 'light', label: 'Light theme' },
    { value: 'dark', label: 'Dark theme' },
    { value: 'system', label: 'Match system theme' },
  ];

  protected select(preference: ThemePreference): void {
    this.theme.setPreference(preference);
  }

  /**
   * Full class string is computed here rather than combining a static `class`
   * attribute with a `[class]` binding, which has subtle merge semantics.
   * Reading the `preference` signal keeps this reactive under OnPush.
   */
  protected buttonClass(value: ThemePreference): string {
    const base =
      'inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
    const active = 'bg-primary text-primary-contrast shadow-sm';
    const inactive =
      'text-content-subtle hover:bg-background-alt hover:text-content';

    return `${base} ${this.theme.preference() === value ? active : inactive}`;
  }
}
