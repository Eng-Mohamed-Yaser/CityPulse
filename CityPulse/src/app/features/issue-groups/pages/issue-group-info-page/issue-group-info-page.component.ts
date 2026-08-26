import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-issue-group-info-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-shell bg-background-alt/40">
      <div class="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
        <nav class="glass-panel flex items-center justify-between gap-3 rounded-2xl px-4 py-3" aria-label="Breadcrumb">
          <div class="flex min-w-0 items-center gap-2 text-sm text-content-muted">
            <a routerLink="/admin/issue-groups" class="font-semibold transition-colors hover:text-primary">
              Issue Groups
            </a>
            <span aria-hidden="true" class="text-content-subtle">/</span>
            <span class="truncate text-content">How clustering works</span>
          </div>

        </nav>

        <article class="glass-panel overflow-hidden rounded-3xl">
          <header class="border-b border-line bg-background-alt/50 px-5 py-7 sm:px-8">
            <p class="section-eyebrow">
              Backend architecture
            </p>
            <h1 class="section-title mt-4">
              How issue groups are created
            </h1>
            <p class="mt-4 max-w-2xl text-sm leading-relaxed text-content-muted sm:text-base">
              Issue groups are never created manually. They are synthesized by the CityPulse geospatial engine when citizens submit reports.
            </p>
          </header>

          <div class="space-y-8 px-5 py-6 sm:px-8">
            <ol class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <li class="rounded-2xl border border-line bg-surface p-5 transition-transform hover:-translate-y-0.5">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  1
                </span>
                <h2 class="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Report ingestion</h2>
                <p class="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Citizens submit reports with a category and GPS coordinates.
                </p>
              </li>
              <li class="rounded-2xl border border-line bg-surface p-5 transition-transform hover:-translate-y-0.5">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  2
                </span>
                <h2 class="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">50m clustering</h2>
                <p class="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  The backend searches for an existing same-category group within a 50-meter radius.
                </p>
              </li>
              <li class="rounded-2xl border border-line bg-surface p-5 transition-transform hover:-translate-y-0.5">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  3
                </span>
                <h2 class="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Group update</h2>
                <p class="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Matching groups increment report count and priority; otherwise a new group is initialized.
                </p>
              </li>
            </ol>

            <div>
              <h2 class="font-display text-base font-bold text-content">
                Municipal responsibilities
              </h2>
              <ul class="mt-3 space-y-2 text-sm text-content-muted">
                <li class="flex gap-2">
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true"></span>
                  <span>Inspect clustered issues ranked by backend priority scores.</span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true"></span>
                  <span>Advance status: Pending → In Review → In Progress → Resolved.</span>
                </li>
                <li class="flex gap-2">
                  <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true"></span>
                  <span>Escalate severity when field conditions warrant higher urgency.</span>
                </li>
              </ul>
            </div>

            <div class="flex justify-end border-t border-line pt-5">
              <a
                routerLink="/admin/issue-groups"
                class="btn-primary"
              >
                Back to Issue Groups
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  `,
})
export class IssueGroupInfoPageComponent {}
