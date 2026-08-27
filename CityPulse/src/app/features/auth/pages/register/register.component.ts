import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -top-40 left-1/2 h-128 w-lg -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      ></div>

      <div class="relative w-full max-w-md">
        <a
          routerLink="/"
          class="mb-8 inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-contrast"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.25"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </span>
          <span
            class="font-display text-lg font-bold tracking-tight text-content"
            >CityPulse</span
          >
        </a>

        <div class="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 class="font-display text-2xl font-bold tracking-tight text-content">
            Create your account
          </h1>
          <p class="mt-2 text-sm text-content-muted">
            Join your community and start reporting local issues.
          </p>

          @if (errorMessage()) {
            <div
              role="alert"
              class="mt-6 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              <svg
                class="mt-0.5 h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-5" novalidate>
            <div>
              <label for="name" class="block text-sm font-medium text-content">
                Full name
              </label>
              <input
                id="name"
                type="text"
                formControlName="name"
                autocomplete="name"
                [attr.aria-invalid]="isInvalid('name')"
                [attr.aria-describedby]="isInvalid('name') ? 'name-error' : null"
                class="mt-1.5 w-full rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-sm text-content transition-colors placeholder:text-content-subtle focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                placeholder="Jane Citizen"
              />
              @if (isInvalid('name')) {
                <p id="name-error" class="mt-1.5 text-xs text-danger">
                  Name must be between 2 and 100 characters.
                </p>
              }
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-content">
                Email
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                [attr.aria-invalid]="isInvalid('email')"
                [attr.aria-describedby]="isInvalid('email') ? 'email-error' : null"
                class="mt-1.5 w-full rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-sm text-content transition-colors placeholder:text-content-subtle focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                placeholder="you@example.com"
              />
              @if (isInvalid('email')) {
                <p id="email-error" class="mt-1.5 text-xs text-danger">
                  Please provide a valid email.
                </p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-content">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                autocomplete="new-password"
                [attr.aria-invalid]="isInvalid('password')"
                [attr.aria-describedby]="'password-hint'"
                class="mt-1.5 w-full rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-sm text-content transition-colors placeholder:text-content-subtle focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                placeholder="At least 8 characters"
              />
              <p
                id="password-hint"
                class="mt-1.5 text-xs"
                [class]="
                  isInvalid('password') ? 'text-danger' : 'text-content-subtle'
                "
              >
                Must be at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              [disabled]="isSubmitting()"
              class="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              @if (isSubmitting()) {
                <svg
                  class="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                  />
                </svg>
                Creating account…
              } @else {
                Create account
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-content-muted">
            Already have an account?
            <a
              routerLink="/auth/login"
              class="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  `,
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  /** Mirrors registerValidator on the server: name 2–100, valid email, password >= 8. */
  protected readonly form: FormGroup = this.fb.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected isInvalid(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/reports/mine');
      },
      error: (error: Error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
