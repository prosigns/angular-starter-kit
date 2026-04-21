import {
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../services/session-storage.service';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';

// Track if token refresh is in progress to avoid multiple refresh calls
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
  null
);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorageService = inject(SessionStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip token refresh for the refresh endpoint itself to avoid infinite loop
  if (req.url.includes('/tokens/refresh')) {
    return next(req);
  }

  // Get token from session storage
  const token = sessionStorageService.getItem<string>('token');

  // Clone the request and add headers
  const authReq = req.clone({
    setHeaders: {
      tenant: 'CareTrack',
      Accept: 'application/json',
      // Add Authorization header if token exists
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {})
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        if (token) {
          // If we have a token but it's invalid, try to refresh it
          return handle401Error(authReq, next, authService, sessionStorageService, router);
        } else {
          // If no token exists, let the request fail so fallback data can be used
          // This allows the analytics service to provide mock data for development
          console.warn('No authentication token found, API request may fail and use fallback data');
          return throwError(() => error);
        }
      }

      return throwError(() => error);
    })
  );
};

/**
 * Handle 401 Unauthorized error by attempting to refresh token
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  sessionStorageService: SessionStorageService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(response => {
        isRefreshing = false;

        // Get the new token from response
        const newToken = response.token;
        refreshTokenSubject.next(newToken);

        // Retry the original request with new token
        const retryReq = req.clone({
          setHeaders: {
            tenant: 'CareTrack',
            Authorization: `Bearer ${newToken}`
          }
        });

        return next(retryReq);
      }),
      catchError(error => {
        isRefreshing = false;

        // Refresh failed: logout unless this was occurrence archive/unarchive
        // (keep user signed in, they'll see the error toast)
        const isOccurrenceArchiveRequest =
          req.url.includes('/occurrence/') &&
          (req.url.includes('/archive') || req.url.includes('/unarchive'));
        if (!isOccurrenceArchiveRequest) {
          // eslint-disable-next-line no-console
          console.error('Token refresh failed:', error);
          authService.logout();
          router.navigate(['/auth/login']);
        }

        return throwError(() => error);
      })
    );
  } else {
    // Token refresh is already in progress, wait for it to complete
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(token => {
        // Retry the original request with the new token
        const retryReq = req.clone({
          setHeaders: {
            tenant: 'CareTrack',
            Authorization: `Bearer ${token}`
          }
        });

        return next(retryReq);
      })
    );
  }
}
