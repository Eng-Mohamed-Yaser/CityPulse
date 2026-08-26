import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { FeaturesSectionComponent } from './sections/features-section/features-section.component';
import { CategoriesSectionComponent } from './sections/categories-section/categories-section.component';
import { ReportSectionComponent } from './sections/report-section/report-section.component';
import { StatisticsSectionComponent } from './sections/statistics-section/statistics-section.component';
import { SmartGroupingSectionComponent } from './sections/smart-grouping-section/smart-grouping-section.component';
import { HowItWorksSectionComponent } from './sections/how-it-works-section/how-it-works-section.component';
import { AboutSectionComponent } from './sections/about-section/about-section.component';
import { HomeCtaComponent } from './sections/home-cta/home-cta.component';

/**
 * Home page shell.
 *
 * Pure composition — each band is its own presentational component. The
 * drag-and-drop report form that previously lived here now sits in
 * `ReportFormComponent` (rendered by `ReportSectionComponent`) so the same
 * upload handling can also back the /reports page without duplication.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSectionComponent,
    FeaturesSectionComponent,
    CategoriesSectionComponent,
    ReportSectionComponent,
    StatisticsSectionComponent,
    SmartGroupingSectionComponent,
    HowItWorksSectionComponent,
    AboutSectionComponent,
    HomeCtaComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
