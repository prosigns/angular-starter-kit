import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import {
  IMenuConfig,
  IMenuItem,
  MenuLoadState,
  SidebarMenuService
} from '../../../core/services/sidebar-menu.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarFlyoutComponent } from './sidebar-flyout.component';

const FLYOUT_OFFSET_X = 8;

interface ISection {
  id: 'core' | 'administrative' | 'analytics';
  labelKey: string;
  items: IMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarFlyoutComponent, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  public menuItems: IMenuItem[] = [];
  public bottomActions: IMenuItem[] = [];
  public isCollapsed = false;
  public loadState: MenuLoadState = 'idle';
  public flyoutVisible = false;
  public flyoutParentItem: IMenuItem | null = null;
  public flyoutSubMenuItems: IMenuItem[] = [];
  public flyoutPosition: { x: number; y: number } = { x: 0, y: 0 };
  public flyoutId: string | null = null;
  public showLogoutConfirm = false;

  public sections: ISection[] = [
    { id: 'core', labelKey: 'sidebar.sections.operations', items: [] },
    { id: 'administrative', labelKey: 'sidebar.sections.administration', items: [] },
    { id: 'analytics', labelKey: 'sidebar.sections.analytics', items: [] }
  ];

  private readonly router = inject(Router);
  private readonly sidebarMenuService = inject(SidebarMenuService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private activeRoute = '';
  private bestMatchCache: { url: string; match: string | null } | null = null;
  private cachedRoutes: string[] | null = null;

  ngOnInit(): void {
    this.activeRoute = this.router.url;
    this.subscribeToMenuConfig();
    this.subscribeToLoadState();
    this.subscribeToRouteChanges();
    this.subscribeToSidebarState();
  }

  public get hasAnyMenu(): boolean {
    return this.sections.some(s => s.items.length > 0);
  }

  public retryLoad(): void {
    this.sidebarMenuService.retryLoad();
  }

  public toggleSidebar(): void {
    this.sidebarMenuService.toggleSidebar();
  }

  public handleMenuItemClick(item: IMenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (item.action) {
      this.handleAction(item.action);
      return;
    }

    if (this.isCollapsed && this.hasChildren(item)) {
      return;
    }

    if (this.hasChildren(item)) {
      this.toggleSubMenu(item);
      return;
    }

    if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

  public onLogoutConfirm(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
  }

  public onLogoutCancel(): void {
    this.showLogoutConfirm = false;
    this.cdr.markForCheck();
  }

  public hasChildren(item: IMenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  public isMenuItemActive(item: IMenuItem): boolean {
    if (!item.route) return false;
    const best = this.getBestMatchingMenuRoute();
    return best !== null && item.route === best;
  }

  public isChildItemActive(child: IMenuItem): boolean {
    if (!child.route) return false;
    const best = this.getBestMatchingMenuRoute();
    return best !== null && child.route === best;
  }

  public onCollapsedParentFocus(item: IMenuItem, event: FocusEvent): void {
    if (!this.isCollapsed || !this.hasChildren(item)) return;
    this.openFlyoutForItem(item, event);
  }

  public onCollapsedIconTrigger(item: IMenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isCollapsed || !this.hasChildren(item)) return;
    this.openFlyoutForItem(item, event);
  }

  public onFlyoutItemSelected(item: IMenuItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
    this.closeFlyout();
  }

  public closeFlyout(): void {
    this.flyoutVisible = false;
    this.cdr.markForCheck();
  }

  public trackByMenuItem(index: number, item: IMenuItem): string | number {
    return item.id || item.route || index;
  }

  @HostListener('document:keydown.escape')
  public onDocumentEscape(): void {
    if (this.showLogoutConfirm) {
      this.onLogoutCancel();
      return;
    }
    if (this.flyoutVisible) {
      this.closeFlyout();
    }
  }

  private subscribeToMenuConfig(): void {
    this.sidebarMenuService.menuConfig$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(config => {
        if (!config) return;
        this.applyConfig(config);
      });
  }

  private subscribeToLoadState(): void {
    this.sidebarMenuService.loadState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.loadState = state;
        this.cdr.markForCheck();
      });
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.activeRoute = this.router.url;
        this.bestMatchCache = null;
        this.expandActiveRoute();
        this.cdr.markForCheck();
      });
  }

  private subscribeToSidebarState(): void {
    this.sidebarMenuService.isCollapsed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(collapsed => {
        this.isCollapsed = collapsed;
        if (this.flyoutVisible) {
          this.flyoutVisible = false;
          this.flyoutParentItem = null;
          this.flyoutSubMenuItems = [];
        }
        this.cdr.markForCheck();
      });
  }

  private applyConfig(config: IMenuConfig): void {
    const filtered = this.filterMenuByRole(config);
    this.menuItems = this.sidebarMenuService.getSortedMenuItems(filtered.menuItems);
    this.bottomActions = filtered.bottomActions || [];
    this.organizeMenuSections(this.menuItems);
    this.cachedRoutes = null;
    this.bestMatchCache = null;
    this.expandActiveRoute();
    this.cdr.markForCheck();
  }

  private filterMenuByRole(config: IMenuConfig): IMenuConfig {
    const userRoles = this.authService.getUserRoles();

    const filterItems = (items: IMenuItem[]): IMenuItem[] =>
      items.reduce<IMenuItem[]>((acc, item) => {
        const requiredRoles = item.roles ?? [];
        const hasAccess =
          requiredRoles.length === 0 ||
          requiredRoles.some(role => userRoles.includes(role));
        if (!hasAccess) return acc;

        acc.push({
          ...item,
          children: item.children ? filterItems(item.children) : undefined
        });
        return acc;
      }, []);

    return {
      menuItems: filterItems(config.menuItems),
      bottomActions: (config.bottomActions ?? []).filter(action => {
        const roles = action.roles ?? [];
        return roles.length === 0 || roles.some(role => userRoles.includes(role));
      })
    };
  }

  private organizeMenuSections(menuItems: IMenuItem[]): void {
    const buckets: Record<ISection['id'], IMenuItem[]> = {
      core: [],
      administrative: [],
      analytics: []
    };

    menuItems.forEach(item => {
      if (item.type === 'divider' || item.id === 'back-to-main' || item.id === 'logout') {
        return;
      }
      switch (item.category) {
        case 'administrative':
        case 'settings':
          buckets.administrative.push(item);
          break;
        case 'analytics':
          buckets.analytics.push(item);
          break;
        case 'forms':
        case 'core':
        default:
          buckets.core.push(item);
      }
    });

    this.sections = [
      { id: 'core', labelKey: 'sidebar.sections.operations', items: buckets.core },
      {
        id: 'administrative',
        labelKey: 'sidebar.sections.administration',
        items: buckets.administrative
      },
      { id: 'analytics', labelKey: 'sidebar.sections.analytics', items: buckets.analytics }
    ];
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'logout':
        this.showLogoutConfirm = true;
        this.cdr.markForCheck();
        break;
      case 'back-to-main':
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  private toggleSubMenu(item: IMenuItem): void {
    if (!item.children) return;
    if (item.isExpanded) {
      item.isExpanded = false;
    } else {
      this.closeAllExpandedItems();
      item.isExpanded = true;
    }
    this.cdr.markForCheck();
  }

  private closeAllExpandedItems(): void {
    this.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.children) item.isExpanded = false;
      });
    });
  }

  private expandActiveRoute(): void {
    this.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.children) {
          item.isExpanded = this.isChildRouteActive(item.children);
        }
      });
    });
  }

  private isChildRouteActive(children: IMenuItem[]): boolean {
    const best = this.getBestMatchingMenuRoute();
    if (!best) return false;
    return children.some(child => child.route === best);
  }

  private getBestMatchingMenuRoute(): string | null {
    if (this.bestMatchCache && this.bestMatchCache.url === this.activeRoute) {
      return this.bestMatchCache.match;
    }

    const url = this.activeRoute.split('?')[0].split('#')[0];
    const routes = this.getAllMenuRoutes();
    const matches = routes.filter(r => r && (url === r || url.startsWith(r + '/')));
    const match =
      matches.length === 0 ? null : matches.reduce((a, b) => (a.length >= b.length ? a : b));

    this.bestMatchCache = { url: this.activeRoute, match };
    return match;
  }

  private getAllMenuRoutes(): string[] {
    if (this.cachedRoutes) return this.cachedRoutes;
    const collect = (items: IMenuItem[], acc: string[]): string[] => {
      for (const item of items) {
        if (item.route) acc.push(item.route);
        if (item.children?.length) collect(item.children, acc);
      }
      return acc;
    };
    const all = collect(
      this.sections.flatMap(s => s.items),
      []
    );
    this.cachedRoutes = Array.from(new Set(all));
    return this.cachedRoutes;
  }

  private openFlyoutForItem(item: IMenuItem, event: Event): void {
    const target = event.target as HTMLElement;
    const button = target.closest('button,a,div');
    const rect = (button as HTMLElement)?.getBoundingClientRect();
    const sidebarWidth = this.isCollapsed ? 56 : 220;

    const x = rect ? rect.left + rect.width + FLYOUT_OFFSET_X : sidebarWidth + FLYOUT_OFFSET_X;
    const y = rect ? rect.top : 64;

    this.flyoutParentItem = item;
    this.flyoutSubMenuItems = item.children || [];
    this.flyoutPosition = { x, y };
    this.flyoutId = 'flyout-' + (item.id || item.route || 'menu');
    this.flyoutVisible = true;
    this.cdr.markForCheck();
  }
}
