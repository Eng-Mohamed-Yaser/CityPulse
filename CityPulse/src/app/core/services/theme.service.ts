import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'citypulse-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Feature-detect `matchMedia` itself, not just `window`. Non-browser and
  // partial-DOM environments (jsdom, SSR shims) provide a `window` object
  // without `matchMedia`, so checking `typeof window` alone still throws.
  private readonly mediaQuery =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  readonly preference = signal<ThemePreference>(this.readStoredPreference());

  readonly resolved = computed<ResolvedTheme>(() => {
    const pref = this.preference();
    if (pref === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return pref;
  });

  constructor() {
    effect(() => {
      this.applyTheme(this.resolved());
    });

    this.mediaQuery?.addEventListener('change', (event) => {
      if (this.preference() === 'system') {
        this.applyTheme(event.matches ? 'dark' : 'light');
      }
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, preference);
    }
  }

  cyclePreference(): void {
    const order: ThemePreference[] = ['light', 'dark', 'system'];
    const current = this.preference();
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.setPreference(next);
  }

  private readStoredPreference(): ThemePreference {
    if (typeof localStorage === 'undefined') {
      return 'system';
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  private applyTheme(theme: ResolvedTheme): void {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }
}
