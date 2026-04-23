import { Routes } from '@angular/router';

export const SYSTEM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        '../../shared/components/layouts/dashboard-layout/dashboard-layout.component'
      ).then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/system-dashboard.component').then(m => m.SystemDashboardComponent),
        title: 'System Dashboard'
      },
      {
        path: 'tenants/subscriptions',
        loadChildren: () =>
          import('./subscriptions/subscriptions.routes').then(m => m.SUBSCRIPTIONS_ROUTES)
      },
      {
        path: 'tenants',
        loadChildren: () =>
          import('./tenants/tenants.routes').then(m => m.TENANTS_ROUTES)
      },
      {
        path: 'programs/configuration',
        loadComponent: () =>
          import('./program-config/program-config.component').then(m => m.ProgramConfigComponent),
        title: 'Program Configuration'
      },
      {
        path: 'programs/configuration/types/:code',
        loadComponent: () =>
          import('./program-config/type-detail/program-type-detail.component').then(
            m => m.ProgramTypeDetailComponent
          ),
        title: 'Program Type'
      },
      {
        path: 'programs',
        loadChildren: () =>
          import('./programs/programs.routes').then(m => m.PROGRAMS_ROUTES)
      }
    ]
  }
];
