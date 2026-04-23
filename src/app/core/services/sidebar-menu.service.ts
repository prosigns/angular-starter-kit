import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { SessionStorageService } from './session-storage.service';

export interface IMenuItem {
  id: string;
  label?: string;
  route?: string;
  icon?: string;
  badge?: string | null;
  order?: number;
  type?: 'divider' | 'item';
  action?: string;
  children?: IMenuItem[];
  isExpanded?: boolean;
  roles?: string[];
  category?: 'core' | 'administrative' | 'analytics' | 'forms' | 'settings';
}

export interface IMenuConfig {
  menuItems: IMenuItem[];
  bottomActions: IMenuItem[];
}

export type MenuLoadState = 'idle' | 'loading' | 'ready' | 'error';

const STORAGE_KEYS = {
  collapsed: 'ct.sidebar.collapsed.v1',
  menuConfig: 'ct.sidebar.menu-config.v6'
} as const;

const MOBILE_BREAKPOINT_PX = 1024;

// SVG path data accepts only command letters, digits, and separators.
// This allowlist rejects anything outside that vocabulary, preventing
// arbitrary JSON content from being rendered as an SVG `d` attribute.
const SAFE_SVG_PATH = /^[\sMmLlHhVvCcSsQqTtAaZz0-9.,\-+eE]*$/;

export function sanitizeIconPath(icon: string | undefined): string {
  if (!icon) return '';
  return SAFE_SVG_PATH.test(icon) ? icon : '';
}

@Injectable({ providedIn: 'root' })
export class SidebarMenuService {
  public readonly menuConfig$: Observable<IMenuConfig | null>;
  public readonly isCollapsed$: Observable<boolean>;
  public readonly loadState$: Observable<MenuLoadState>;

  private readonly http = inject(HttpClient);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly menuConfigSubject = new BehaviorSubject<IMenuConfig | null>(null);
  private readonly isCollapsedSubject = new BehaviorSubject<boolean>(this.readStoredCollapsed());
  private readonly loadStateSubject = new BehaviorSubject<MenuLoadState>('idle');

  constructor() {
    this.menuConfig$ = this.menuConfigSubject.asObservable();
    this.isCollapsed$ = this.isCollapsedSubject.asObservable();
    this.loadState$ = this.loadStateSubject.asObservable();
    this.loadMenuConfig();
    this.bindResponsiveListener();
  }

  public toggleSidebar(): void {
    const next = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(next);
    this.persistCollapsed(next);
  }

  public collapseSidebar(): void {
    this.isCollapsedSubject.next(true);
    this.persistCollapsed(true);
  }

  public expandSidebar(): void {
    this.isCollapsedSubject.next(false);
    this.persistCollapsed(false);
  }

  public getIsCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  public retryLoad(): void {
    this.loadMenuConfig();
  }

  public getSortedMenuItems(menuItems: IMenuItem[]): IMenuItem[] {
    return [...menuItems]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => ({
        ...item,
        children: item.children ? this.getSortedMenuItems(item.children) : undefined,
        isExpanded: item.isExpanded ?? false
      }));
  }

  public hasChildren(item: IMenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  public getDefaultMenuConfig(): IMenuConfig {
    return { menuItems: [], bottomActions: [] };
  }

  private bindResponsiveListener(): void {
    if (typeof window === 'undefined') return;

    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isMobileViewport() && !this.isCollapsedSubject.value) {
          this.isCollapsedSubject.next(true);
        }
      });
  }

  private readStoredCollapsed(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.collapsed);
      if (stored === null) return this.isMobileViewport();
      return JSON.parse(stored) === true;
    } catch {
      return this.isMobileViewport();
    }
  }

  private persistCollapsed(value: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.collapsed, JSON.stringify(value));
    } catch {
      // Storage may be unavailable (private mode); state remains in-memory.
    }
  }

  private isMobileViewport(): boolean {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < MOBILE_BREAKPOINT_PX;
  }

  private loadMenuConfig(): void {
    this.loadStateSubject.next('loading');

    const cached = this.sessionStorage.getItem<IMenuConfig>(STORAGE_KEYS.menuConfig);
    if (cached) {
      this.menuConfigSubject.next(this.normalizeConfig(cached));
      this.loadStateSubject.next('ready');
    }

    this.http
      .get<IMenuConfig>('/assets/sidebar-menu.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: config => {
          const normalized = this.normalizeConfig(config);
          this.menuConfigSubject.next(normalized);
          this.loadStateSubject.next('ready');
          try {
            this.sessionStorage.setItem(STORAGE_KEYS.menuConfig, normalized);
          } catch {
            // Non-fatal: cache is an optimization, not a requirement.
          }
        },
        error: () => {
          // If we already surfaced a cached config, keep it; otherwise surface error.
          if (!this.menuConfigSubject.value) {
            this.loadStateSubject.next('error');
          }
        }
      });
  }

  private normalizeConfig(config: IMenuConfig): IMenuConfig {
    return {
      menuItems: this.initializeMenuItems(config.menuItems || []).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      ),
      bottomActions: (config.bottomActions || []).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      )
    };
  }

  private initializeMenuItems(menuItems: IMenuItem[]): IMenuItem[] {
    return menuItems.map(item => ({
      ...item,
      icon: sanitizeIconPath(item.icon),
      isExpanded: item.isExpanded ?? false,
      children: item.children ? this.initializeMenuItems(item.children) : undefined
    }));
  }

}
