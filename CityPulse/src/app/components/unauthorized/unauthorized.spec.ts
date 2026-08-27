import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized';

function setup(returnUrl: string | null) {
  return TestBed.configureTestingModule({
    imports: [UnauthorizedComponent],
    providers: [
      provideRouter([]),
      // UnauthorizedComponent -> AuthService -> HttpClient
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
          },
        },
      },
    ],
  }).compileComponents();
}

describe('UnauthorizedComponent', () => {
  let fixture: ComponentFixture<UnauthorizedComponent>;

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should render the 403 forbidden state', async () => {
    localStorage.clear();
    await setup(null);
    fixture = TestBed.createComponent(UnauthorizedComponent);
    await fixture.whenStable();

    expect(text()).toContain('403');
    expect(text()).toContain('Access Restricted');
  });

  it('should expose an alert role so it is announced', async () => {
    localStorage.clear();
    await setup(null);
    fixture = TestBed.createComponent(UnauthorizedComponent);
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')
    ).not.toBeNull();
  });

  it('should show the blocked address recorded by the guard', async () => {
    localStorage.clear();
    await setup('/admin/dashboard');
    fixture = TestBed.createComponent(UnauthorizedComponent);
    await fixture.whenStable();

    expect(text()).toContain('Blocked address');
    expect(text()).toContain('/admin/dashboard');
  });

  it('should omit the blocked address block when no returnUrl is present', async () => {
    localStorage.clear();
    await setup(null);
    fixture = TestBed.createComponent(UnauthorizedComponent);
    await fixture.whenStable();

    expect(text()).not.toContain('Blocked address');
  });

  it('should show the signed-in account and offer My Reports', async () => {
    localStorage.setItem('accessToken', 'spec-token');
    localStorage.setItem(
      'citypulse-user',
      JSON.stringify({ id: 'c1', name: 'Test Citizen', email: 'citizen@example.com', role: 'Citizen' })
    );

    await setup('/admin/dashboard');
    fixture = TestBed.createComponent(UnauthorizedComponent);
    await fixture.whenStable();

    expect(text()).toContain('citizen@example.com');
    expect(text()).toContain('Citizen');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('a[href="/reports/mine"]')
    ).not.toBeNull();
  });

  it('should offer sign-in when there is no session', async () => {
    localStorage.clear();
    await setup('/admin/dashboard');
    fixture = TestBed.createComponent(UnauthorizedComponent);
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('a[href="/auth/login"]')
    ).not.toBeNull();
  });
});
