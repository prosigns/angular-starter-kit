import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);

  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Skip caching if explicitly disabled
  if (req.headers.has('X-Skip-Cache')) {
    return next(req);
  }

  // Check if we have a cached response
  const cachedResponse = cacheService.get(req.url);
  if (cachedResponse) {
    // eslint-disable-next-line no-console
    console.log('📦 Serving from cache:', req.url);
    return of(cachedResponse);
  }

  // Make the request and cache the response
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        // Cache successful responses
        if (event.status === 200) {
          cacheService.set(req.url, event);
        }
      }
    })
  );
};
