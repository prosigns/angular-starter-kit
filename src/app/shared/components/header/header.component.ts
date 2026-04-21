import { AsyncPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';
import { AuthService, IAuthState } from '../../../core/services/auth.service';
import { SidebarMenuService } from '../../../core/services/sidebar-menu.service';
import { CommandPaletteComponent } from '../command-palette/command-palette.component';

type MenuId = 'notifications' | 'user' | null;

interface IHeaderNotification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  variant: 'info' | 'success' | 'warning' | 'danger';
}

interface IHeaderUser {
  initials: string;
  displayName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, DatePipe, RouterModule, TranslateModule, CommandPaletteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="fixed top-0 right-0 z-[45] flex items-center gap-3 px-4 bg-white border-b border-ct-border transition-[left] duration-300 ease-in-out"
      [style.left]="
        (sidebarMenu.isCollapsed$ | async)
          ? 'var(--sidebar-width-collapsed)'
          : 'var(--sidebar-width)'
      "
      style="height: var(--header-height)"
    >
      <!-- Left: Hamburger -->
      <button
        type="button"
        (click)="sidebarMenu.toggleSidebar()"
        class="ct-icon-btn"
        [attr.aria-label]="'header.toggleSidebar' | translate"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style="stroke-width: 1.5"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          ></path>
        </svg>
      </button>

      <!-- Center: Command palette trigger -->
      <button
        type="button"
        (click)="openCommandPalette()"
        class="hidden md:flex items-center gap-2 px-3 h-8 rounded-btn border border-ct-border hover:bg-surface-elevated transition-colors mx-auto max-w-md w-full"
        style="color: var(--text-muted)"
        [attr.aria-label]="'header.search' | translate"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style="stroke-width: 1.5"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          ></path>
        </svg>
        <span class="text-caption">{{ 'header.searchPlaceholder' | translate }}</span>
        <kbd class="ml-auto text-badge border border-ct-border rounded px-1.5 py-0.5">
          {{ shortcutLabel }}
        </kbd>
      </button>

      <!-- Right: Notifications + User -->
      <div class="flex items-center gap-1 ml-auto md:ml-0">
        <!-- Mobile search button -->
        <button
          type="button"
          (click)="openCommandPalette()"
          class="ct-icon-btn md:hidden"
          [attr.aria-label]="'header.search' | translate"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style="stroke-width: 1.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            ></path>
          </svg>
        </button>

        <!-- Notifications -->
        <div class="relative" #notificationsAnchor>
          <button
            #notificationsButton
            type="button"
            (click)="toggleMenu('notifications')"
            class="ct-icon-btn relative"
            [class.ct-icon-btn--active]="openMenu === 'notifications'"
            [attr.aria-label]="'header.notifications' | translate"
            [attr.aria-haspopup]="'menu'"
            [attr.aria-expanded]="openMenu === 'notifications'"
            aria-controls="header-notifications-menu"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="stroke-width: 1.5"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              ></path>
            </svg>
            @if (unreadCount() > 0) {
              <span
                class="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 text-[10px] font-semibold bg-danger text-white rounded-full flex items-center justify-center"
                [attr.aria-label]="unreadCount() + ' unread'"
              >
                {{ unreadBadge() }}
              </span>
            }
          </button>

          @if (openMenu === 'notifications') {
            <div
              id="header-notifications-menu"
              role="menu"
              class="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-1rem)] bg-white border border-ct-border rounded-lg shadow-lg overflow-hidden ct-menu-animate"
              (keydown.escape)="closeMenu()"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-ct-border">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold" style="color: var(--text-primary)">
                    {{ 'header.notifications' | translate }}
                  </span>
                  @if (unreadCount() > 0) {
                    <span
                      class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary-100"
                      style="color: var(--primary)"
                    >
                      {{ unreadCount() }}
                    </span>
                  }
                </div>
                @if (unreadCount() > 0) {
                  <button
                    type="button"
                    (click)="markAllRead()"
                    class="text-xs font-medium hover:underline"
                    style="color: var(--primary)"
                  >
                    {{ 'header.markAllRead' | translate }}
                  </button>
                }
              </div>

              <div class="max-h-[26rem] overflow-y-auto">
                @if (notifications.length === 0) {
                  <div
                    class="flex flex-col items-center justify-center py-10 px-4 text-center"
                    style="color: var(--text-muted)"
                  >
                    <svg
                      class="w-10 h-10 mb-2 opacity-40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style="stroke-width: 1.2"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                      ></path>
                    </svg>
                    <p class="text-sm">{{ 'header.noNotifications' | translate }}</p>
                  </div>
                } @else {
                  <ul class="divide-y divide-ct-border">
                    @for (n of notifications; track n.id) {
                      <li>
                        <button
                          type="button"
                          role="menuitem"
                          (click)="onNotificationClick(n)"
                          class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-elevated transition-colors focus:outline-none focus-visible:bg-surface-elevated"
                          [class.bg-primary-50]="!n.read"
                        >
                          <span
                            class="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                            [class.bg-blue-500]="n.variant === 'info'"
                            [class.bg-emerald-500]="n.variant === 'success'"
                            [class.bg-amber-500]="n.variant === 'warning'"
                            [class.bg-red-500]="n.variant === 'danger'"
                            aria-hidden="true"
                          ></span>
                          <div class="flex-1 min-w-0">
                            <p
                              class="text-sm font-medium truncate"
                              style="color: var(--text-primary)"
                            >
                              {{ n.title }}
                            </p>
                            <p class="text-xs mt-0.5 line-clamp-2" style="color: var(--text-secondary)">
                              {{ n.body }}
                            </p>
                            <p class="text-[11px] mt-1" style="color: var(--text-muted)">
                              {{ n.timestamp | date: 'short' }}
                            </p>
                          </div>
                          @if (!n.read) {
                            <span
                              class="mt-1 w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0"
                              aria-hidden="true"
                            ></span>
                          }
                        </button>
                      </li>
                    }
                  </ul>
                }
              </div>

              <div class="border-t border-ct-border px-4 py-2 text-center">
                <a
                  routerLink="/notifications"
                  (click)="closeMenu()"
                  class="text-xs font-medium hover:underline"
                  style="color: var(--primary)"
                >
                  {{ 'header.viewAllNotifications' | translate }}
                </a>
              </div>
            </div>
          }
        </div>

        <!-- User Menu -->
        <div class="relative pl-1 ml-1 border-l border-ct-border" #userAnchor>
          <button
            #userButton
            type="button"
            (click)="toggleMenu('user')"
            class="flex items-center gap-2 px-1.5 h-9 rounded-btn hover:bg-surface-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-colors"
            [class.bg-surface-elevated]="openMenu === 'user'"
            [attr.aria-label]="'header.userMenu' | translate"
            [attr.aria-haspopup]="'menu'"
            [attr.aria-expanded]="openMenu === 'user'"
            aria-controls="header-user-menu"
          >
            @if ((user$ | async); as user) {
              @if (user.avatarUrl) {
                <img
                  [src]="user.avatarUrl"
                  [alt]="user.displayName"
                  class="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              } @else {
                <span
                  class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-badge font-semibold flex-shrink-0"
                  style="color: var(--primary)"
                  aria-hidden="true"
                >
                  {{ user.initials }}
                </span>
              }
              <span
                class="hidden sm:flex flex-col items-start leading-tight"
                style="color: var(--text-primary)"
              >
                <span class="text-table-cell font-medium truncate max-w-[8rem]">
                  {{ user.displayName }}
                </span>
                <span class="text-[11px]" style="color: var(--text-muted)">{{ user.role }}</span>
              </span>
              <svg
                class="w-4 h-4 transition-transform"
                [class.rotate-180]="openMenu === 'user'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style="stroke-width: 1.5; color: var(--text-muted)"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                ></path>
              </svg>
            }
          </button>

          @if (openMenu === 'user') {
            <div
              id="header-user-menu"
              role="menu"
              class="absolute right-0 mt-2 w-64 bg-white border border-ct-border rounded-lg shadow-lg overflow-hidden ct-menu-animate"
              (keydown.escape)="closeMenu()"
            >
              @if ((user$ | async); as user) {
                <div class="px-4 py-3 border-b border-ct-border">
                  <p class="text-sm font-semibold truncate" style="color: var(--text-primary)">
                    {{ user.displayName }}
                  </p>
                  <p class="text-xs truncate" style="color: var(--text-muted)">{{ user.email }}</p>
                  <span
                    class="mt-1.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary-100"
                    style="color: var(--primary)"
                  >
                    {{ user.role }}
                  </span>
                </div>
              }

              <nav class="py-1" role="none">
                <a
                  role="menuitem"
                  routerLink="/profile"
                  (click)="closeMenu()"
                  class="ct-menu-item"
                >
                  <svg class="ct-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  {{ 'header.profile' | translate }}
                </a>
                <a
                  role="menuitem"
                  routerLink="/settings"
                  (click)="closeMenu()"
                  class="ct-menu-item"
                >
                  <svg class="ct-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  {{ 'header.accountSettings' | translate }}
                </a>
                <a
                  role="menuitem"
                  routerLink="/help"
                  (click)="closeMenu()"
                  class="ct-menu-item"
                >
                  <svg class="ct-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                  {{ 'header.help' | translate }}
                </a>
              </nav>

              <div class="border-t border-ct-border py-1">
                <button
                  type="button"
                  role="menuitem"
                  (click)="onLogout()"
                  class="ct-menu-item w-full text-left text-red-600 hover:bg-red-50"
                >
                  <svg class="ct-menu-icon text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  {{ 'header.signOut' | translate }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>

    <app-command-palette
      [isOpen]="commandPaletteOpen"
      (closed)="commandPaletteOpen = false"
    ></app-command-palette>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .ct-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: var(--radius-btn, 8px);
        color: var(--text-secondary);
        transition: background-color 150ms ease, color 150ms ease;
        position: relative;
      }
      .ct-icon-btn:hover {
        background: var(--surface-elevated, #f3f4f6);
      }
      .ct-icon-btn:focus-visible {
        outline: 2px solid var(--primary, #3b82f6);
        outline-offset: 1px;
      }
      .ct-icon-btn--active {
        background: var(--surface-elevated, #f3f4f6);
        color: var(--text-primary);
      }

      .ct-menu-animate {
        transform-origin: top right;
        animation: ct-menu-in 140ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes ct-menu-in {
        from {
          opacity: 0;
          transform: scale(0.96) translateY(-4px);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }

      .ct-menu-item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.5rem 1rem;
        font-size: 0.8125rem;
        color: var(--text-primary, #0f172a);
        transition: background-color 120ms ease;
        cursor: pointer;
      }
      .ct-menu-item:hover {
        background: var(--surface-elevated, #f3f4f6);
      }
      .ct-menu-item:focus-visible {
        outline: none;
        background: var(--surface-elevated, #f3f4f6);
      }

      .ct-menu-icon {
        width: 1rem;
        height: 1rem;
        color: var(--text-muted, #6b7280);
        flex-shrink: 0;
      }
    `
  ]
})
export class HeaderComponent {
  @ViewChild('notificationsAnchor') private notificationsAnchor?: ElementRef<HTMLElement>;
  @ViewChild('userAnchor') private userAnchor?: ElementRef<HTMLElement>;
  @ViewChild('notificationsButton') private notificationsButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('userButton') private userButton?: ElementRef<HTMLButtonElement>;

  public readonly sidebarMenu = inject(SidebarMenuService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public openMenu: MenuId = null;
  public commandPaletteOpen = false;
  public readonly shortcutLabel = this.detectShortcutLabel();

  public readonly user$: Observable<IHeaderUser | null> = this.authService.authState$.pipe(
    map(state => this.projectUser(state)),
    takeUntilDestroyed(this.destroyRef)
  );

  public notifications: IHeaderNotification[] = [
    {
      id: '1',
      title: 'New patient assigned',
      body: 'Jane Smith has been added to your caseload.',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      read: false,
      variant: 'info'
    },
    {
      id: '2',
      title: 'Compliance check passed',
      body: 'Monthly audit completed with no findings.',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      read: false,
      variant: 'success'
    },
    {
      id: '3',
      title: 'Document expiring',
      body: 'Provider credential expires in 7 days.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
      read: false,
      variant: 'warning'
    }
  ];

  public unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public unreadBadge(): string {
    const count = this.unreadCount();
    return count > 99 ? '99+' : String(count);
  }

  public toggleMenu(menu: Exclude<MenuId, null>): void {
    this.openMenu = this.openMenu === menu ? null : menu;
    this.cdr.markForCheck();
  }

  public closeMenu(): void {
    if (this.openMenu === null) return;
    const toRestore =
      this.openMenu === 'notifications' ? this.notificationsButton : this.userButton;
    this.openMenu = null;
    toRestore?.nativeElement.focus();
    this.cdr.markForCheck();
  }

  public markAllRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.cdr.markForCheck();
  }

  public onNotificationClick(notification: IHeaderNotification): void {
    if (!notification.read) {
      notification.read = true;
    }
    this.closeMenu();
  }

  public openCommandPalette(): void {
    this.openMenu = null;
    this.commandPaletteOpen = true;
    this.cdr.markForCheck();
  }

  public onLogout(): void {
    this.openMenu = null;
    this.authService.logout();
  }

  @HostListener('document:keydown', ['$event'])
  public onDocumentKeydown(event: KeyboardEvent): void {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const shortcut = isMac ? event.metaKey : event.ctrlKey;
    if (shortcut && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openCommandPalette();
      return;
    }
    if (event.key === 'Escape' && this.openMenu !== null) {
      this.closeMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (this.openMenu === null) return;
    const target = event.target as Node;
    const anchor =
      this.openMenu === 'notifications'
        ? this.notificationsAnchor?.nativeElement
        : this.userAnchor?.nativeElement;
    if (anchor && !anchor.contains(target)) {
      this.openMenu = null;
      this.cdr.markForCheck();
    }
  }

  private projectUser(state: IAuthState): IHeaderUser | null {
    const u = state.user;
    if (!u) {
      return {
        initials: '—',
        displayName: 'Guest',
        email: '',
        role: '',
        avatarUrl: null
      };
    }
    const first = (u.firstName || '').trim();
    const last = (u.lastName || '').trim();
    const initials =
      (first.charAt(0) + last.charAt(0)).toUpperCase() ||
      (u.userName || u.email || '?').charAt(0).toUpperCase();
    const displayName =
      [first, last].filter(Boolean).join(' ') || u.userName || u.email || 'User';
    const role = u.roles?.[0]?.displayName ?? '';
    return {
      initials,
      displayName,
      email: u.email || '',
      role,
      avatarUrl: u.imageUrl || null
    };
  }

  private detectShortcutLabel(): string {
    if (typeof navigator === 'undefined') return 'Ctrl+K';
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl+K';
  }
}
