import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';

/**
 * Adds a one-shot scroll-reveal to an element.
 *
 * The hidden/animated state lives entirely in CSS behind a
 * `prefers-reduced-motion: no-preference` media query (see styles.css), so:
 *  - reduced-motion users get fully visible, static content;
 *  - if IntersectionObserver is unavailable, we reveal immediately rather than
 *    leaving content stranded at opacity 0.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: {
    '[attr.data-reveal]': 'variant()',
  },
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  /** `''` = fade-up (default), `'scale'` = fade + scale-in. */
  readonly variant = input<'' | 'scale'>('', { alias: 'appReveal' });

  /** Stagger, in milliseconds. */
  readonly revealDelay = input<number>(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    const element = this.host.nativeElement;

    if (typeof IntersectionObserver === 'undefined') {
      this.reveal();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.reveal();
            this.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private reveal(): void {
    const element = this.host.nativeElement;
    const delay = this.revealDelay();

    if (delay > 0) {
      element.style.transitionDelay = `${delay}ms`;
    }

    element.classList.add('is-revealed');
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
