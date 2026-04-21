import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { SecurityService } from '../services/security.service';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add CSRF token for state-changing requests
  if (shouldAddCSRFToken(req)) {
    const csrfToken = getCSRFToken();

    if (csrfToken) {
      const csrfReq = req.clone({
        setHeaders: {
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      return next(csrfReq);
    }
  }

  return next(req);
};

function shouldAddCSRFToken(req: HttpRequest<unknown>): boolean {
  // Add CSRF token for POST, PUT, PATCH, DELETE requests
  const statefulMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return statefulMethods.includes(req.method.toUpperCase());
}

function getCSRFToken(): string | null {
  // Try to get CSRF token from meta tag first
  const metaToken = getCSRFTokenFromMeta();

  if (metaToken) {
    return metaToken;
  }

  // Try localStorage as fallback
  return localStorage.getItem('csrf-token');
}

function getCSRFTokenFromMeta(): string | null {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
}

// Helper functions for CSRF token management
export function initializeCSRFToken(): void {
  const securityService = inject(SecurityService);

  let csrfToken = getCSRFToken();

  if (!csrfToken) {
    csrfToken = securityService.generateCSRFToken();
    storeCSRFToken(csrfToken);
  }
}

export function storeCSRFToken(token: string): void {
  localStorage.setItem('csrf-token', token);

  // Also add to meta tag for other scripts
  let metaTag = document.querySelector('meta[name="csrf-token"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', 'csrf-token');
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', token);
}

export function clearCSRFToken(): void {
  localStorage.removeItem('csrf-token');

  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    metaTag.remove();
  }
}
