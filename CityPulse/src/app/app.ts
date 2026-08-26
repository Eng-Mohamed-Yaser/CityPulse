import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService, ThemePreference } from './core/services/theme.service';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html'
})
export class App {
  protected readonly appName = signal('CityPulse');

  // Injected for its side effect: constructing ThemeService starts the effect
  // that keeps the `dark` class on <html> in sync with the stored preference.
  protected readonly theme = inject(ThemeService);

  protected setTheme(preference: ThemePreference): void {
    this.theme.setPreference(preference);
  }
}
