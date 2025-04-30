import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

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
  return authService.refreshToken().pipe(
    switchMap(tokens => {
      // Update tokens and retry request with new token
      tokenService.setTokens(tokens);
      const newReq = addTokenToRequest(req, tokens.accessToken);
      return next(newReq);
    }),
    catchError(refreshError => {
      // If refresh fails, log out the user
      authService.logout();
      return throwError(() => refreshError);
    })
  );
}
