import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SidebarMenuService } from '../../../core/services/sidebar-menu.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, SidebarComponent, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header></app-header>
    <app-sidebar></app-sidebar>

    <main
      class="transition-all duration-300 ease-in-out"
      [style.margin-left]="
        (sidebarMenuService.isCollapsed$ | async)
          ? 'var(--sidebar-width-collapsed)'
          : 'var(--sidebar-width)'
      "
      style="margin-top: var(--header-height); min-height: calc(100vh - var(--header-height)); padding: var(--space-4); background: var(--bg-body)"
    >
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class DashboardLayoutComponent {
  public readonly sidebarMenuService = inject(SidebarMenuService);
}
