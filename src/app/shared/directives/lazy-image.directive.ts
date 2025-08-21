import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: 'img[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements AfterViewInit, OnDestroy {
  @Input() public loading = 'lazy';
  @Input() public appLazyImage = '';

  private _observer!: IntersectionObserver;
  private readonly _element = inject(ElementRef);

  public ngAfterViewInit(): void {
    // If IntersectionObserver is available, use it for better performance
    if ('IntersectionObserver' in window) {
      this._observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this._loadImage();
              this._observer?.unobserve(this._element.nativeElement);
            }
          });
        },
        {
          rootMargin: '100px 0px'
        }
      );

      this._observer.observe(this._element.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this._loadImage();
    }
  }

  public ngOnDestroy(): void {
    // Clean up observer when directive is destroyed
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  private _loadImage(): void {
    const img = this._element.nativeElement as HTMLImageElement;
    // Set the actual image source
    if (this.appLazyImage) {
      img.src = this.appLazyImage;
    }

    // Apply fade-in animation
    img.style.opacity = '0';
    img.onload = () => {
      img.style.transition = 'opacity 0.3s ease-in';
      img.style.opacity = '1';
    };
  }
}
