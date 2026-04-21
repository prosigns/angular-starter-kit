import { Injectable, ComponentRef, ViewContainerRef, Type } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { DynamicDialogComponent } from './dynamic-dialog.component';

export interface IDynamicDialogConfig {
  header?: string;
  width?: string;
  height?: string;
  modal?: boolean;
  closable?: boolean;
  maximizable?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  data?: unknown;
  styleClass?: string;
  contentStyle?: Record<string, unknown>;
  baseZIndex?: number;
  breakpoints?: Record<string, string>;
  closeOnEscape?: boolean;
  showBackdrop?: boolean;
  backdropClass?: string;
  animationDuration?: number;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  dismissableMask?: boolean;
}

export interface IDynamicDialogData {
  data?: unknown;
}
export interface IDynamicDialogComponent {
  dialogRef?: unknown;
}

export class DynamicDialogRef {
  private _onClose = new Subject<unknown>();
  private _onMaximize = new Subject<unknown>();
  private _onDestroy = new Subject<unknown>();

  constructor(private _componentRef: ComponentRef<DynamicDialogComponent>) {}

  public get onClose(): Observable<unknown> {
    return this._onClose.asObservable();
  }

  public get onMaximize(): Observable<unknown> {
    return this._onMaximize.asObservable();
  }

  public get onDestroy(): Observable<unknown> {
    return this._onDestroy.asObservable();
  }

  public close(result?: unknown): void {
    this._onClose.next(result);
    this.destroy();
  }

  public maximize(): void {
    this._onMaximize.next(null);
  }

  public destroy(): void {
    this._onDestroy.next(null);
    this._componentRef.destroy();
  }
}

@Injectable({
  providedIn: 'root'
})
export class DynamicDialogService {
  private _dialogComponentRef: ComponentRef<DynamicDialogComponent> | null = null;
  private _viewContainerRef: ViewContainerRef | null = null;

  public setViewContainerRef(viewContainerRef: ViewContainerRef): void {
    this._viewContainerRef = viewContainerRef;
  }

  public open<T>(component: Type<T>, config?: IDynamicDialogConfig): DynamicDialogRef {
    if (!this._viewContainerRef)
      throw new Error('ViewContainerRef not set. Call setViewContainerRef() first.');

    // Close any existing dialog before creating a new one
    this.closeAll();

    // Create new dialog component
    this._dialogComponentRef = this._viewContainerRef.createComponent(DynamicDialogComponent);
    const dialogInstance = this._dialogComponentRef.instance;

    // Apply configuration
    if (config) Object.assign(dialogInstance, config);

    // Load the component into the dialog
    dialogInstance.loadComponent(component, config?.data);

    // Create and set up dialog reference
    const dialogRef = new DynamicDialogRef(this._dialogComponentRef);
    dialogInstance.dialogRef = dialogRef;

    // Clean up reference when dialog is destroyed
    dialogRef.onDestroy.subscribe(() => {
      this._dialogComponentRef = null;
    });

    return dialogRef;
  }

  public closeAll(): void {
    if (this._dialogComponentRef) {
      this._dialogComponentRef.destroy();
      this._dialogComponentRef = null;
    }
  }
}
