import { Injectable, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';

export interface IOutsideClickConfig {
  element: ElementRef | HTMLElement;
  callback: () => void;
  excludeElements?: (ElementRef | HTMLElement)[];
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OutsideClickService implements OnDestroy {
  private _ngZone = inject(NgZone);

  private _registeredElements = new Map<string, IOutsideClickConfig>();
  private _destroy$ = new Subject<void>();
  private _documentClickListener?: (event: Event) => void;
  private _isListening = false;

  public register(id: string, config: IOutsideClickConfig): () => void {
    this._registeredElements.set(id, { ...config, enabled: config.enabled ?? true });

    if (!this._isListening) {
      this._startListening();
    }

    return () => this.unregister(id);
  }

  public unregister(id: string): void {
    this._registeredElements.delete(id);

    if (this._registeredElements.size === 0) {
      this._stopListening();
    }
  }

  public setEnabled(id: string, enabled: boolean): void {
    const config = this._registeredElements.get(id);
    if (config) {
      config.enabled = enabled;
    }
  }

  public isRegistered(id: string): boolean {
    return this._registeredElements.has(id);
  }

  public getRegisteredIds(): string[] {
    return Array.from(this._registeredElements.keys());
  }

  public clearAll(): void {
    this._registeredElements.clear();
    this._stopListening();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.clearAll();
  }

  private _startListening(): void {
    if (this._isListening) return;

    this._ngZone.runOutsideAngular(() => {
      this._documentClickListener = (event: Event) => {
        this._handleDocumentClick(event);
      };

      document.addEventListener('click', this._documentClickListener, true);
      document.addEventListener('touchstart', this._documentClickListener, true);
    });

    this._isListening = true;
  }

  private _stopListening(): void {
    if (!this._isListening || !this._documentClickListener) return;

    document.removeEventListener('click', this._documentClickListener, true);
    document.removeEventListener('touchstart', this._documentClickListener, true);
    this._documentClickListener = undefined;
    this._isListening = false;
  }

  private _handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    this._registeredElements.forEach(config => {
      if (!config.enabled) return;

      const element = this._getHTMLElement(config.element);
      if (!element) return;

      if (element.contains(target)) return;

      if (config.excludeElements) {
        const isInsideExcluded = config.excludeElements.some(excludeEl => {
          const excludeElement = this._getHTMLElement(excludeEl);
          return excludeElement && excludeElement.contains(target);
        });

        if (isInsideExcluded) return;
      }

      this._ngZone.run(() => {
        config.callback();
      });
    });
  }

  private _getHTMLElement(element: ElementRef | HTMLElement): HTMLElement | null {
    if (element instanceof ElementRef) {
      return element.nativeElement;
    }
    return element;
  }
}

import { Directive, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';

@Directive({
  selector: '[appOutsideClick]',
  standalone: true
})
export class OutsideClickDirective implements OnInit, OnDestroy, OnChanges {
  @Input() public appOutsideClick = true;
  @Input() public excludeElements: (ElementRef | HTMLElement)[] = [];
  @Output() public outsideClick = new EventEmitter<void>();

  private _elementRef = inject(ElementRef);
  private _outsideClickService = inject(OutsideClickService);
  private _unsubscribe?: () => void;
  private _elementId: string;

  constructor() {
    this._elementId = `directive-${Math.random().toString(36).substr(2, 9)}`;
  }

  public ngOnInit(): void {
    this._unsubscribe = this._outsideClickService.register(this._elementId, {
      element: this._elementRef,
      callback: () => this.outsideClick.emit(),
      excludeElements: this.excludeElements,
      enabled: this.appOutsideClick
    });
  }

  public ngOnDestroy(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  public ngOnChanges(): void {
    if (this._outsideClickService.isRegistered(this._elementId)) {
      this._outsideClickService.setEnabled(this._elementId, this.appOutsideClick);
    }
  }
}
