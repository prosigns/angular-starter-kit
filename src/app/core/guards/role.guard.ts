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

    return authService.authState$.pipe(
      take(1),
      map(() => {
        const userRoles = authService.getUserRoles();
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (hasRequiredRole) {
          return true;
        } else {
          toastService.showError('Access denied. You do not have the required permissions.');
          return router.createUrlTree(['/system/dashboard']);
        }
      })
    );
  };
};
