import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

/**
 * Custom preloading strategy that:
 * 1. Preloads routes marked with data.preload=true
 * 2. Allows priority levels (lower numbers preload first)
 * 3. Adds a delay based on priority to prevent network congestion
 */
@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  public preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    // Skip preloading if explicitly set to false or not defined
    if (route.data?.['preload'] === false) {
      return of(null);
    }

    // If preload is explicitly true or has priority, preload it
    if (route.data?.['preload'] === true || route.data?.['preloadPriority'] !== undefined) {
      // Default priority is 50 (medium)
      const priority = route.data?.['preloadPriority'] ?? 50;

      // Calculate delay based on priority (lower priority = higher delay)
      // Priority 0 = no delay, priority 100 = 10 second delay
      const delayMs = Math.max(0, 100 - priority) * 100;

      // Preloading route with calculated priority and delay

      // Preload after the calculated delay
      return of(true).pipe(
        delay(delayMs),
        mergeMap(() => load())
      );
    }

    // By default, don't preload
    return of(null);
  }
}
