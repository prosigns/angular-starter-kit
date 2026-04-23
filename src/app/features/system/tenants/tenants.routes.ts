import { Routes } from '@angular/router';

export const TENANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tenant-list.component').then(m => m.TenantListComponent),
    title: 'All Tenants'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./tenant-detail.component').then(m => m.TenantDetailComponent),
    title: 'Tenant Detail'
  }
];
