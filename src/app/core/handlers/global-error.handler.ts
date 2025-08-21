import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private _loggingService = inject(LoggingService);
  private _toastService = inject(ToastService);
  private _router = inject(Router);
  private _ngZone = inject(NgZone);

  public handleError(error: unknown): void {
    // Extract error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const message = errorObj.message || 'Undefined error';
    const stack = errorObj.stack || '';
    const isNetworkError = error instanceof TypeError && errorObj.message.includes('NetworkError');

    // Log error to monitoring service
    this._loggingService.logError(message, { stack, error });

    // Handle the error in the Angular zone to trigger change detection
    this._ngZone.run(() => {
      if (isNetworkError) {
        this._toastService.showError('Network error. Please check your connection and try again.');
      } else {
        this._toastService.showError('An unexpected error occurred. Our team has been notified.');
      }

      // For critical errors, navigate to error page
      if (this._isCriticalError(error)) {
        this._router.navigate(['/error'], {
          queryParams: {
            id: this._loggingService.getLastErrorId()
          }
        });
      }
    });

    // Log to console in dev mode
    console.error('Global error handler caught an error:', error);
  }

  private _isCriticalError(error: unknown): boolean {
    // Determine if this is a critical error that should redirect to error page
    const criticalErrorPatterns = [
      'ChunkLoadError', // Failed to load a critical JS chunk
      'ReferenceError', // Undefined variables, missing references
      'TypeError', // Type errors, typically null or undefined issues
      'ResizeObserver loop', // Infinite loop in ResizeObserver
      'Maximum update depth' // React-like recursive rendering error
    ];

    if (!error) return false;

    const errorObj = error instanceof Error ? error : null;
    if (!errorObj) return false;

    // Check if error message contains any critical patterns
    return criticalErrorPatterns.some(
      pattern => errorObj.message?.includes(pattern) || errorObj.stack?.includes(pattern)
    );
  }
}
