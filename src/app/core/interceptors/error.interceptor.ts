import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { LoggingService } from '../services/logging.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const loggingService = inject(LoggingService);

  return next(req).pipe(
    catchError(error => {
      // Log error to monitoring service
      loggingService.logError(
        `Error: ${error.status} - ${error.statusText || 'Unknown'} - ${req.url}`,
        error
      );

      // Show user-friendly message based on error type
      let errorMessage = 'An unexpected error occurred. Please try again later.';

      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your internet connection.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Our team has been notified.';
      }

      // Optionally, extract custom error message from API if available
      if (error.error?.message) {
        errorMessage = error.error.message;
      }

      // Show error message to user via toast
      toastService.showError(errorMessage);

      return throwError(() => error);
    })
  );
};
