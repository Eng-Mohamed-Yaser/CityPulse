import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  // --- Original API, unchanged ---
  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((state) => !state);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  // --- Additions required by the navigation spec ---

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isAdmin = this.auth.isAdmin;
  readonly user = this.auth.user;
  readonly profileMenuOpen = signal(false);
  readonly profileInitials = computed(() => {
    const name = this.user()?.name?.trim() ?? '';
    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return 'CP';
    }

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });

  /** Close the drawer when focus/pointer leaves the header entirely. */
  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(event: Event): void {
    if (!this.isMobileMenuOpen() && !this.profileMenuOpen()) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.closeMobileMenu();
    }
  }

  /** Escape closes the drawer, per keyboard-accessibility requirements. */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenus();
  }

  protected toggleProfileMenu(): void {
    this.profileMenuOpen.update((open) => !open);
  }

  protected closeMenus(): void {
    this.closeMobileMenu();
    this.profileMenuOpen.set(false);
  }

  protected signOut(): void {
    this.closeMenus();
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/'),
      // clearSession() already ran inside the service on failure.
      error: () => void this.router.navigateByUrl('/'),
    });
  }
}
