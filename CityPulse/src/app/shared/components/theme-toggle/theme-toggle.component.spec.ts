import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let theme: ThemeService;

  const buttons = (): HTMLButtonElement[] =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    );

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    theme = TestBed.inject(ThemeService);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render one button per theme preference', () => {
    expect(buttons().length).toBe(3);
  });

  it('should default to the system preference being pressed', () => {
    expect(theme.preference()).toBe('system');
    expect(buttons()[2].getAttribute('aria-pressed')).toBe('true');
  });

  it('should set the dark preference when the dark button is clicked', async () => {
    buttons()[1].click();
    await fixture.whenStable();

    expect(theme.preference()).toBe('dark');
    expect(theme.resolved()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should set the light preference when the light button is clicked', async () => {
    buttons()[1].click();
    await fixture.whenStable();

    buttons()[0].click();
    await fixture.whenStable();

    expect(theme.preference()).toBe('light');
    expect(theme.resolved()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should move aria-pressed to the active option', async () => {
    buttons()[0].click();
    await fixture.whenStable();

    expect(buttons()[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('false');
    expect(buttons()[2].getAttribute('aria-pressed')).toBe('false');
  });

  it('should persist the chosen preference', async () => {
    buttons()[1].click();
    await fixture.whenStable();

    expect(localStorage.getItem('citypulse-theme')).toBe('dark');
  });
});
