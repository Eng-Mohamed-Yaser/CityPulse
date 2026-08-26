import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page-shell bg-background-alt/40">
      <div class="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        <header class="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div aria-hidden="true" class="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl"></div>
          <p class="section-eyebrow">Account</p>
          <h1 class="section-title mt-4">Profile</h1>
          <p class="section-subtitle max-w-2xl">
            Manage your CityPulse identity and follow the reports you have submitted.
          </p>
        </header>

        @if (user(); as account) {
          <section class="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]" aria-label="Account profile">
            <article class="glass-panel rounded-2xl p-6 sm:p-8">
              <div class="flex items-center gap-4">
                <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-contrast">
                  {{ initials() }}
                </span>
                <div class="min-w-0">
                  <h2 class="truncate font-display text-xl font-bold text-content">{{ account.name }}</h2>
                  <p class="truncate text-sm text-content-muted">{{ account.email }}</p>
                </div>
              </div>
              <div class="mt-8 rounded-xl border border-line bg-surface p-4">
                <p class="text-xs font-semibold uppercase tracking-wider text-content-subtle">Role</p>
                <p class="mt-1 text-sm font-semibold text-content">{{ account.role }}</p>
              </div>
            </article>

            <article id="account" class="glass-panel rounded-2xl p-6 sm:p-8">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-content">Account Information</h2>
                  <p class="mt-1 text-sm text-content-muted">Information currently available from your account.</p>
                </div>
                <svg class="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.1a7.5 7.5 0 0 1 15 0" />
                </svg>
              </div>
              <dl class="mt-6 divide-y divide-line">
                <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                  <dt class="text-sm text-content-muted">Name</dt>
                  <dd class="text-sm font-semibold text-content">{{ account.name }}</dd>
                </div>
                <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                  <dt class="text-sm text-content-muted">Email</dt>
                  <dd class="break-all text-sm font-semibold text-content">{{ account.email }}</dd>
                </div>
                <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                  <dt class="text-sm text-content-muted">Account role</dt>
                  <dd class="text-sm font-semibold text-content">{{ account.role }}</dd>
                </div>
                <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                  <dt class="text-sm text-content-muted">User ID</dt>
                  <dd class="break-all font-mono text-xs text-content-muted">{{ account.id }}</dd>
                </div>
              </dl>
            </article>
          </section>

          <section class="glass-panel rounded-2xl p-6 sm:p-8" aria-labelledby="reports-heading">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="reports-heading" class="font-display text-xl font-bold text-content">My Reports</h2>
                <p class="mt-1 text-sm text-content-muted">Track the reports submitted from your account.</p>
              </div>
              <a routerLink="/reports/mine" class="btn-primary">View my reports</a>
            </div>
          </section>
        }
      </div>
    </main>
  `,
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;

  protected initials(): string {
    const parts = this.user()?.name.trim().split(/\s+/).filter(Boolean) ?? [];
    return parts.length
      ? parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
      : 'CP';
  }
}
