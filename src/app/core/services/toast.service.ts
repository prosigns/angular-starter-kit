import { Injectable, signal } from '@angular/core';

export enum ToastTypeEnum {
  success = 'success',
  error = 'error',
  info = 'info',
  warning = 'warning'
}

export interface IToast {
  id: string;
  message: string;
  type: ToastTypeEnum;
  duration: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Signal to store active toasts
  public readonly toasts = signal<IToast[]>([]);

  public showSuccess(message: string, duration = 5000): void {
    this._showToast(message, ToastTypeEnum.success, duration);
  }

  public showError(message: string, duration = 7000): void {
    this._showToast(message, ToastTypeEnum.error, duration);
  }

  public showInfo(message: string, duration = 5000): void {
    this._showToast(message, ToastTypeEnum.info, duration);
  }

  public showWarning(message: string, duration = 6000): void {
    this._showToast(message, ToastTypeEnum.warning, duration);
  }

  public removeToast(id: string): void {
    this.toasts.update(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }

  public clearAll(): void {
    this.toasts.set([]);
  }

  private _showToast(message: string, type: ToastTypeEnum, duration: number): void {
    const id = this._generateId();

    const toast: IToast = {
      id,
      message,
      type,
      duration,
      createdAt: new Date()
    };

    // Add toast to the list
    this.toasts.update(currentToasts => [...currentToasts, toast]);

    // Automatically remove toast after duration
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  private _generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
