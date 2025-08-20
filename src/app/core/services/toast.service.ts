import { Injectable, signal } from '@angular/core';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Signal to store active toasts
  readonly toasts = signal<Toast[]>([]);

  showSuccess(message: string, duration = 5000): void {
    this.showToast(message, ToastType.SUCCESS, duration);
  }

  showError(message: string, duration = 7000): void {
    this.showToast(message, ToastType.ERROR, duration);
  }

  showInfo(message: string, duration = 5000): void {
    this.showToast(message, ToastType.INFO, duration);
  }

  showWarning(message: string, duration = 6000): void {
    this.showToast(message, ToastType.WARNING, duration);
  }

  private showToast(message: string, type: ToastType, duration: number): void {
    const id = this.generateId();

    const toast: Toast = {
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

  removeToast(id: string): void {
    this.toasts.update(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
