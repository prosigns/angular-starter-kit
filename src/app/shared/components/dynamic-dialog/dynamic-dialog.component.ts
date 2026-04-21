import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Type,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  Renderer2,
  HostListener,
  inject,
  Injector,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef } from './dynamic-dialog.service';

@Component({
  selector: 'app-dynamic-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="modal"
      class="dialog-backdrop"
      [class]="backdropClass"
      (click)="onBackdropClick()"
      (keydown.enter)="onBackdropClick()"
      (keydown.space)="onBackdropClick()"
      tabindex="0"
      role="button"
      aria-label="Close dialog"
    ></div>
    <div
      #dialogContainer
      class="dynamic-dialog-container"
      [class]="styleClass"
      [ngStyle]="contentStyle"
      [style.z-index]="baseZIndex"
      (keydown)="onKeyDown($event)"
      tabindex="-1"
      role="dialog"
      [attr.aria-labelledby]="header ? 'dialog-header' : null"
      [attr.aria-modal]="modal"
    >
      <div class="dialog-container" [style.width]="width" [style.height]="height">
        <div class="dialog-header" *ngIf="header || closable || maximizable">
          <span id="dialog-header" class="dialog-title" *ngIf="header">{{ header }}</span>
          <div class="dialog-header-actions">
            <button
              *ngIf="maximizable"
              class="dialog-action-btn maximize-btn"
              (click)="onMaximize()"
              (keydown.enter)="onMaximize()"
              (keydown.space)="onMaximize()"
              type="button"
              aria-label="Maximize"
            >
              ⬜
            </button>
            <button
              *ngIf="closable"
              class="dialog-action-btn close-btn"
              (click)="onClose()"
              (keydown.enter)="onClose()"
              (keydown.space)="onClose()"
              type="button"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="dialog-content"><ng-container #dynamicContent></ng-container></div>
      </div>
    </div>
  `,
  styleUrls: ['./dynamic-dialog.component.scss']
})
export class DynamicDialogComponent implements OnDestroy, AfterViewInit {
  @ViewChild('dynamicContent', { read: ViewContainerRef })
  public dynamicContent!: ViewContainerRef;
  @ViewChild('dialogContainer') public dialogContainer!: ElementRef;

  @Input() public header?: string;
  @Input() public width = '50vw';
  @Input() public height = 'auto';
  @Input() public modal = true;
  @Input() public closable = true;
  @Input() public maximizable = false;
  @Input() public resizable = false;
  @Input() public draggable = false;
  @Input() public styleClass?: string;
  @Input() public contentStyle?: Record<string, unknown>;
  @Input() public baseZIndex = 1000;
  @Input() public breakpoints?: Record<string, string>;
  @Input() public closeOnEscape = true;
  @Input() public showBackdrop = true;
  @Input() public dismissableMask = true;
  @Input() public backdropClass?: string;
  @Input() public animationDuration = 300;
  @Input() public position = 'center';
  @Input() public autoFocus = true;
  @Input() public restoreFocus = true;
  @Input() public minWidth?: string;
  @Input() public minHeight?: string;
  @Input() public maxWidth?: string;
  @Input() public maxHeight?: string;

  public isMaximized = false;
  public dialogRef?: DynamicDialogRef;

  private _componentRef?: ComponentRef<unknown>;
  private _isDragging = false;
  private _dragOffset = { x: 0, y: 0 };

  private _renderer = inject(Renderer2);
  private _elementRef = inject(ElementRef);
  private _viewInitialized = false;
  private _pendingComponentLoad?: { component: Type<unknown>; data?: unknown };

  @HostListener('document:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent): void {
    if (this._isDragging && this.draggable) {
      this._renderer.setStyle(
        this.dialogContainer.nativeElement,
        'left',
        `${event.clientX - this._dragOffset.x}px`
      );
      this._renderer.setStyle(
        this.dialogContainer.nativeElement,
        'top',
        `${event.clientY - this._dragOffset.y}px`
      );
    }
  }

  @HostListener('document:mouseup')
  public onMouseUp(): void {
    if (this._isDragging) {
      this._isDragging = false;
      this._renderer.removeClass(document.body, 'dialog-dragging');
    }
  }

  public ngAfterViewInit(): void {
    this._viewInitialized = true;
    if (this._pendingComponentLoad) {
      this.loadComponent(this._pendingComponentLoad.component, this._pendingComponentLoad.data);
      this._pendingComponentLoad = undefined;
    }
    // Prevent body scroll when dialog opens
    this._renderer.addClass(document.body, 'dialog-open');

    // Focus the dialog for accessibility
    if (this.autoFocus && this.dialogContainer) {
      setTimeout(() => {
        this.dialogContainer.nativeElement.focus();
      }, 100);
    }
  }

  public ngOnDestroy(): void {
    if (this._componentRef) {
      this._componentRef.destroy();
    }
    // Restore body scroll when dialog closes
    this._renderer.removeClass(document.body, 'dialog-open');
  }

  public loadComponent<T>(component: Type<T>, data?: unknown): void {
    if (!this._viewInitialized) {
      this._pendingComponentLoad = { component, data };
      return;
    }
    if (!this.dynamicContent) throw new Error('ViewContainerRef is not available');
    const injector = Injector.create({
      providers: [{ provide: DynamicDialogRef, useValue: this.dialogRef }],
      parent: this.dynamicContent.injector
    });
    this._componentRef = this.dynamicContent.createComponent(component, { injector });
    if (data && this._componentRef.instance && typeof this._componentRef.instance === 'object') {
      (this._componentRef.instance as Record<string, unknown>)['data'] = data;
    }
    if (
      this.dialogRef &&
      this._componentRef.instance &&
      typeof this._componentRef.instance === 'object'
    ) {
      (this._componentRef.instance as Record<string, unknown>)['dialogRef'] = this.dialogRef;
      // Make data available through dialogRef.data for backward compatibility
      if (data) {
        (this.dialogRef as unknown as Record<string, unknown>)['data'] = data;
      }
    }
  }

  public onClose(result?: unknown): void {
    if (this.dialogRef) this.dialogRef.close(result);
  }

  public onMaximize(): void {
    this.isMaximized = !this.isMaximized;
    if (this.dialogRef) this.dialogRef.maximize();
  }

  public onBackdropClick(): void {
    if (this.modal && this.dismissableMask) this.onClose();
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape) this.onClose();
  }

  public onMouseDown(event: MouseEvent): void {
    if (this.draggable && !this.isMaximized) {
      this._isDragging = true;
      const rect = this.dialogContainer.nativeElement.getBoundingClientRect();
      this._dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      this._renderer.addClass(document.body, 'dialog-dragging');
    }
  }
}
