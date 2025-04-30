import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard'
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
        title: 'User Management'
      },
      {
        path: 'users/new',
        loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
        title: 'Create User'
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent),
        title: 'Edit User'
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent),
        title: 'Admin Settings'
      }
    ]
  }
]; 