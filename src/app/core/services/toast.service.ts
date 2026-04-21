import { Injectable, signal } from '@angular/core';

export enum ToastTypeEnum {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

export interface IToastAction {
  label: string;
  handler: () => void;
}

export interface IToastConfig {
  type?: ToastTypeEnum;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: IToastAction;
}

export interface IToast {
  id: string;
  type: ToastTypeEnum;
  title: string;
  message: string;
  duration: number;
  dismissible: boolean;
  action: IToastAction | null;
  createdAt: number;
}

export interface IToastHandle {
  id: string;
  dismiss: () => void;
}

const DEFAULT_DURATIONS: Record<ToastTypeEnum, number> = {
  [ToastTypeEnum.SUCCESS]: 5000,
  [ToastTypeEnum.INFO]: 5000,
  [ToastTypeEnum.WARNING]: 6000,
  [ToastTypeEnum.ERROR]: 7000
};

const MAX_TOASTS = 5;
const DEDUPE_WINDOW_MS = 1500;
const MIN_DURATION_MS = 1500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  public readonly toasts = signal<IToast[]>([]);

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly remainingByToast = new Map<string, { expiresAt: number; duration: number }>();
  private idCounter = 0;

  public show(config: IToastConfig): IToastHandle {
    const type = config.type ?? ToastTypeEnum.INFO;
    const rawDuration = config.duration ?? DEFAULT_DURATIONS[type];
    const duration = Math.max(MIN_DURATION_MS, rawDuration);

    const recent = this.findRecentDuplicate(type, config.title ?? '', config.message);
    if (recent) {
      this.restartTimer(recent.id, duration);
      return { id: recent.id, dismiss: () => this.removeToast(recent.id) };
    }

    const toast: IToast = {
      id: this.generateId(),
      type,
      title: config.title ?? this.defaultTitle(type),
      message: config.message,
      duration,
      dismissible: config.dismissible ?? true,
      action: config.action ?? null,
      createdAt: Date.now()
    };

    this.toasts.update(list => {
      const next = [...list, toast];
      while (next.length > MAX_TOASTS) {
        const removed = next.shift();
        if (removed) this.clearTimer(removed.id);
      }
      return next;
    });

    this.startTimer(toast.id, toast.duration);
    return { id: toast.id, dismiss: () => this.removeToast(toast.id) };
  }

  public showSuccess(message: string, duration?: number): IToastHandle {
    return this.show({ type: ToastTypeEnum.SUCCESS, message, duration });
  }

  public showError(message: string, duration?: number): IToastHandle {
    return this.show({ type: ToastTypeEnum.ERROR, message, duration });
  }

  public showInfo(message: string, duration?: number): IToastHandle {
    return this.show({ type: ToastTypeEnum.INFO, message, duration });
  }

  public showWarning(message: string, duration?: number): IToastHandle {
    return this.show({ type: ToastTypeEnum.WARNING, message, duration });
  }

  public removeToast(id: string): void {
    this.clearTimer(id);
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  public clearAll(): void {
    for (const id of this.timers.keys()) this.clearTimer(id);
    this.toasts.set([]);
  }

  public pause(id: string): void {
    const handle = this.timers.get(id);
    const remaining = this.remainingByToast.get(id);
    if (!handle || !remaining) return;
    clearTimeout(handle);
    this.timers.delete(id);
    const msLeft = Math.max(0, remaining.expiresAt - Date.now());
    this.remainingByToast.set(id, { expiresAt: 0, duration: msLeft });
  }

  public resume(id: string): void {
    const paused = this.remainingByToast.get(id);
    if (!paused || paused.expiresAt !== 0) return;
    this.startTimer(id, paused.duration);
  }

  private startTimer(id: string, duration: number): void {
    this.clearTimer(id);
    const handle = setTimeout(() => this.removeToast(id), duration);
    this.timers.set(id, handle);
    this.remainingByToast.set(id, { expiresAt: Date.now() + duration, duration });
  }

  private restartTimer(id: string, duration: number): void {
    this.startTimer(id, duration);
  }

  private clearTimer(id: string): void {
    const handle = this.timers.get(id);
    if (handle) clearTimeout(handle);
    this.timers.delete(id);
    this.remainingByToast.delete(id);
  }

  private findRecentDuplicate(
    type: ToastTypeEnum,
    title: string,
    message: string
  ): IToast | null {
    const now = Date.now();
    const list = this.toasts();
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];
      if (now - t.createdAt > DEDUPE_WINDOW_MS) continue;
      if (t.type === type && t.title === title && t.message === message) return t;
    }
    return null;
  }

  private defaultTitle(type: ToastTypeEnum): string {
    switch (type) {
      case ToastTypeEnum.SUCCESS:
        return 'Success';
      case ToastTypeEnum.ERROR:
        return 'Error';
      case ToastTypeEnum.WARNING:
        return 'Warning';
      case ToastTypeEnum.INFO:
      default:
        return 'Notice';
    }
  }

  private generateId(): string {
    this.idCounter = (this.idCounter + 1) >>> 0;
    return `toast-${Date.now().toString(36)}-${this.idCounter.toString(36)}`;
  }
}
