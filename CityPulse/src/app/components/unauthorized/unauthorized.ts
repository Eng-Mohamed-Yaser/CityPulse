import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * 403 page shown when a signed-in account lacks permission for a URL.
 *
 * Purely presentational: it reads the existing AuthService session state and the
 * `returnUrl` query param that roleGuard already attaches. It performs no
 * authorization decision of its own.
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './unauthorized.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  /** The URL the visitor was blocked from, as recorded by roleGuard. */
  protected readonly attemptedUrl = computed(
    () => this.route.snapshot.queryParamMap.get('returnUrl') ?? null
  );
}
