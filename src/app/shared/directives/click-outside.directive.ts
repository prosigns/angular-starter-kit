import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() public clickOutside = new EventEmitter<void>();

  private readonly _elementRef = inject(ElementRef);

  constructor() {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: EventTarget | null): void {
    const clickedInside = this._elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
