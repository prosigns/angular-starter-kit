import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';

@Directive({
  selector: 'img[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements AfterViewInit, OnDestroy {
  @HostBinding('attr.loading') loading = 'lazy';
  @Input() appLazyImage: string | undefined;
  
  private observer: IntersectionObserver | undefined;
  private element: HTMLImageElement;
  
  constructor(private el: ElementRef) {
    this.element = this.el.nativeElement;
  }
  
  ngAfterViewInit(): void {
    // If IntersectionObserver is available, use it for better performance
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(this.element);
          }
        });
      }, {
        rootMargin: '100px 0px'
      });
      
      this.observer.observe(this.element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }
  }
  
  ngOnDestroy(): void {
    // Clean up observer when directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  private loadImage(): void {
    // Set the actual image source
    if (this.appLazyImage) {
      this.element.src = this.appLazyImage;
    }
    
    // Apply fade-in animation
    this.element.style.opacity = '0';
    this.element.onload = () => {
      this.element.style.transition = 'opacity 0.3s ease-in';
      this.element.style.opacity = '1';
    };
  }
} 