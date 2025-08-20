import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private loggingService = inject(LoggingService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  handleError(error: any): void {
    // Extract error information
    const message = error.message || 'Undefined error';
    const stack = error.stack || '';
    const isNetworkError = error instanceof TypeError && error.message.includes('NetworkError');

    // Log error to monitoring service
    this.loggingService.logError(message, { stack, error });

    // Handle the error in the Angular zone to trigger change detection
    this.ngZone.run(() => {
      if (isNetworkError) {
        this.toastService.showError('Network error. Please check your connection and try again.');
      } else {
        this.toastService.showError('An unexpected error occurred. Our team has been notified.');
      }

      // For critical errors, navigate to error page
      if (this.isCriticalError(error)) {
        this.router.navigate(['/error'], {
          queryParams: {
            id: this.loggingService.getLastErrorId()
          }
        });
      }
    });

    // Log to console in dev mode
    console.error('Global error handler caught an error:', error);
  }

  private isCriticalError(error: any): boolean {
    // Determine if this is a critical error that should redirect to error page
    const criticalErrorPatterns = [
      'ChunkLoadError', // Failed to load a critical JS chunk
      'ReferenceError', // Undefined variables, missing references
      'TypeError', // Type errors, typically null or undefined issues
      'ResizeObserver loop', // Infinite loop in ResizeObserver
      'Maximum update depth' // React-like recursive rendering error
    ];

    if (!error) return false;

    // Check if error message contains any critical patterns
    return criticalErrorPatterns.some(
      pattern => error.message?.includes(pattern) || error.stack?.includes(pattern)
    );
  }
}
