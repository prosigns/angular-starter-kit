import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // Only log in development mode
  if (!environment.production) {
    const startTime = Date.now();

    // eslint-disable-next-line no-console
    console.group(`🌐 HTTP ${req.method} ${req.url}`);
    // eslint-disable-next-line no-console
    console.log('Request:', {
      method: req.method,
      url: req.url,
      headers: req.headers.keys().reduce(
        (acc, key) => {
          // Don't log sensitive headers
          if (key.toLowerCase() !== 'authorization') {
            acc[key] = req.headers.get(key);
          } else {
            acc[key] = '[HIDDEN]';
          }
          return acc;
        },
        {} as Record<string, string | null>
      ),
      body: req.body
    });

    return next(req).pipe(
      tap({
        next: response => {
          const duration = Date.now() - startTime;
          // eslint-disable-next-line no-console
          console.log(`✅ Response (${duration}ms):`, response);
          // eslint-disable-next-line no-console
          console.groupEnd();
        },
        error: error => {
          const duration = Date.now() - startTime;
          // eslint-disable-next-line no-console
          console.error(`❌ Error (${duration}ms):`, error);
          // eslint-disable-next-line no-console
          console.groupEnd();
        }
      })
    );
  }

  return next(req);
};
