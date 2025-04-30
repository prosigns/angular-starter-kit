import { Directive, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Base class for components and services to handle safe subscription cleanup.
 * Provides a destroy$ subject that emits when the component is destroyed,
 * and a safe method to automatically unsubscribe when using takeUntil.
 * 
 * Usage:
 * ```
 * @Component({...})
 * export class MyComponent extends UnsubscribeOnDestroy {
 *   constructor() {
 *     super();
 *     
 *     someObservable$.pipe(
 *       this.takeUntilDestroy()
 *     ).subscribe(value => {
 *       // Handle value
 *     });
 *   }
 * }
 * ```
 */
@Directive()
export abstract class UnsubscribeOnDestroy implements OnDestroy {
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];
  
  /**
   * Operator to automatically unsubscribe when component is destroyed.
   * Use with pipe() operator.
   */
  protected takeUntilDestroy<T>() {
    return takeUntil<T>(this.destroy$);
  }
  
  /**
   * Convenience method to add subscription to auto-cleanup list.
   * For cases where takeUntil approach isn't suitable.
   */
  protected addSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }
  
  /**
   * Safe unsubscribe helper for manually managed subscriptions.
   */
  protected safeUnsubscribe(subscription: Subscription | undefined): void {
    if (subscription && !subscription.closed) {
      subscription.unsubscribe();
    }
  }
  
  /**
   * Clean up subscriptions on component destruction.
   */
  ngOnDestroy(): void {
    // Complete the destroy subject
    this.destroy$.next();
    this.destroy$.complete();
    
    // Unsubscribe from any manually tracked subscriptions
    this.subscriptions.forEach(subscription => {
      this.safeUnsubscribe(subscription);
    });
    this.subscriptions = [];
  }
} 