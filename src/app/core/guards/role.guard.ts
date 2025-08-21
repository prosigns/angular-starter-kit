import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toastService = inject(ToastService);

    return authService.userRoles$.pipe(
      take(1),
      map(userRoles => {
        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (hasRequiredRole) {
          return true;
        } else {
          // Show access denied message
          toastService.showError('Access denied. You do not have the required permissions.');

          // Redirect to home or dashboard
          return router.createUrlTree(['/dashboard']);
        }
      })
    );
  };
};
