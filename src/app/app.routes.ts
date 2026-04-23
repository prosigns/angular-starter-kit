import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [
      () => import('./core/guards/auth.guard').then(m => m.authGuard),
      () => import('./core/guards/role.guard').then(m => m.roleGuard(['SystemAdmin']))
    ]
  },
  {
    path: 'system',
    loadChildren: () => import('./features/system/system.routes').then(m => m.SYSTEM_ROUTES),
    canActivate: [
      () => import('./core/guards/auth.guard').then(m => m.authGuard),
      () => import('./core/guards/role.guard').then(m => m.roleGuard(['SystemAdmin']))
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
