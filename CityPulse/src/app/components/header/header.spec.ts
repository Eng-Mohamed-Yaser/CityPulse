import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const menuButton = (): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[aria-controls="mobile-menu"]'
    )!;

  const drawer = (): HTMLElement | null =>
    (fixture.nativeElement as HTMLElement).querySelector('#mobile-menu');

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      // HeaderComponent -> AuthService -> HttpClient
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with the mobile menu closed', () => {
    expect(component.isMobileMenuOpen()).toBe(false);
    expect(drawer()).toBeNull();
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('should toggle the mobile menu open and closed', async () => {
    component.toggleMobileMenu();
    await fixture.whenStable();
    expect(component.isMobileMenuOpen()).toBe(true);
    expect(drawer()).not.toBeNull();
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');

    component.toggleMobileMenu();
    await fixture.whenStable();
    expect(component.isMobileMenuOpen()).toBe(false);
    expect(drawer()).toBeNull();
  });

  it('should close the mobile menu on Escape', async () => {
    component.toggleMobileMenu();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(component.isMobileMenuOpen()).toBe(false);
  });

  it('should close the mobile menu when pointing outside the header', async () => {
    component.toggleMobileMenu();
    await fixture.whenStable();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await fixture.whenStable();

    expect(component.isMobileMenuOpen()).toBe(false);
    outside.remove();
  });

  it('should show Login and Register when unauthenticated', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(component.isAuthenticated()).toBe(false);
    expect(text).toContain('Login');
    expect(text).toContain('Register');
    expect(text).not.toContain('Sign out');
  });
});
