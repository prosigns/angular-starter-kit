import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  // Skip interceptor for auth endpoints that don't need token
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Add token to requests
  const accessToken = tokenService.getAccessToken();
  if (accessToken) {
    req = addTokenToRequest(req, accessToken);
  }

  return next(req).pipe(
    catchError(error => {
      // If 401 Unauthorized, try to refresh token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return handleUnauthorizedError(authService, tokenService, req, next);
      }
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${token}`
    }
  });
}

function handleUnauthorizedError(
  authService: AuthService,
  tokenService: TokenService,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    // Queue this request until the token refresh completes
    return refreshTokenSubject.pipe(
      filter((token: string | null): token is string => token !== null),
      take(1),
      switchMap((token: string) => next(addTokenToRequest(req, token)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap(tokens => {
      isRefreshing = false;
      tokenService.setTokens(tokens);
      refreshTokenSubject.next(tokens.accessToken);
      return next(addTokenToRequest(req, tokens.accessToken));
    }),
    catchError(refreshError => {
      isRefreshing = false;
      authService.logout();
      return throwError(() => refreshError);
    })
  );
}
