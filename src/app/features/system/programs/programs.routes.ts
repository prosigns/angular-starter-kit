import { Routes } from '@angular/router';

export const PROGRAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./program-list.component').then(m => m.ProgramListComponent),
    title: 'Programs'
  },
  {
    path: 'new',
    loadComponent: () => import('./wizard/program-create-wizard.component').then(m => m.ProgramCreateWizardComponent),
    title: 'Create Program'
  },
  {
    path: ':id',
    loadComponent: () => import('./program-detail.component').then(m => m.ProgramDetailComponent),
    title: 'Program Detail'
  }
];
