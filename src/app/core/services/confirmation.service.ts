import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export interface IConfirmationResult {
  confirmed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  public confirmation$: Observable<IConfirmationConfig | null>;
  public result$: Observable<IConfirmationResult | null>;

  private _confirmationSubject = new BehaviorSubject<IConfirmationConfig | null>(null);
  private _resultSubject = new BehaviorSubject<IConfirmationResult | null>(null);

  constructor() {
    this.confirmation$ = this._confirmationSubject.asObservable();
    this.result$ = this._resultSubject.asObservable();
  }

  public confirm(config: IConfirmationConfig): Promise<boolean> {
    return new Promise(resolve => {
      this._resultSubject.next(null);

      const fullConfig: IConfirmationConfig = {
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'info',
        ...config
      };

      this._confirmationSubject.next(fullConfig);

      const subscription = this.result$.subscribe(result => {
        if (result !== null) {
          subscription.unsubscribe();
          this.hide();
          resolve(result.confirmed);
        }
      });
    });
  }

  public confirmDialog(): void {
    this._resultSubject.next({ confirmed: true });
  }

  public cancelDialog(): void {
    this._resultSubject.next({ confirmed: false });
  }

  public hide(): void {
    this._confirmationSubject.next(null);
    this._resultSubject.next(null);
  }

  public isVisible(): Observable<boolean> {
    return new Observable(observer => {
      this.confirmation$.subscribe(config => {
        observer.next(config !== null);
      });
    });
  }
}
