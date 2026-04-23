import { Routes } from '@angular/router';

export const SUBSCRIPTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./subscription-list.component').then(m => m.SubscriptionListComponent),
    title: 'Subscription Management'
  }
];
