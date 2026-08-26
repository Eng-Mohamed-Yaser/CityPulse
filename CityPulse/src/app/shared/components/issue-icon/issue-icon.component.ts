import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Renders the inline SVG for an issue-category icon name.
 *
 * The names come from `CATEGORY_CONFIG[category].icon` in the existing
 * issue-groups model — a field that was previously declared but never rendered
 * anywhere. No icon library is installed in this project, so these are inline
 * paths (consistent with the rest of the codebase) rather than a new dependency.
 */
@Component({
  selector: 'app-issue-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [class]="class()"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('circle-alert') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4.5" />
          <path d="M12 16h.01" />
        }
        @case ('lightbulb') {
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path
            d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.3V16h6v-.9c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3Z"
          />
        }
        @case ('droplets') {
          <path
            d="M7.5 3.5c1.8 2 3.5 4 3.5 5.8a3.5 3.5 0 0 1-7 0C4 7.5 5.7 5.5 7.5 3.5Z"
          />
          <path
            d="M16 10.5c2 2.3 4 4.6 4 6.7a4 4 0 0 1-8 0c0-2.1 2-4.4 4-6.7Z"
          />
        }
        @case ('trash-2') {
          <path d="M4 7h16" />
          <path d="M10 4h4a1 1 0 0 1 1 1v2H9V5a1 1 0 0 1 1-1Z" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M10.5 11v6" />
          <path d="M13.5 11v6" />
        }
        @case ('cone') {
          <path d="M3 20h18" />
          <path d="M12 3.5 18 20H6L12 3.5Z" />
          <path d="M9.4 11.5h5.2" />
          <path d="M8.2 15.5h7.6" />
        }
        @default {
          <circle cx="12" cy="12" r="9" />
          <path d="M9.8 9.4a2.3 2.3 0 0 1 4.4.8c0 1.6-2.2 1.9-2.2 3.3" />
          <path d="M12 17h.01" />
        }
      }
    </svg>
  `,
})
export class IssueIconComponent {
  /** Icon key from `CATEGORY_CONFIG[category].icon`. */
  readonly name = input.required<string>();

  /** Tailwind sizing/colour classes for the generated <svg>. */
  readonly class = input<string>('h-5 w-5');
}
