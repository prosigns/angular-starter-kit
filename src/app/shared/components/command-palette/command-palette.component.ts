import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  IMenuConfig,
  IMenuItem,
  SidebarMenuService
} from '../../../core/services/sidebar-menu.service';

interface ICommand {
  id: string;
  label: string;
  route: string;
  section: string;
  icon?: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh] bg-black/40 ct-cp-backdrop"
        (click)="close()"
        role="presentation"
      >
        <div
          class="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-ct-border overflow-hidden ct-cp-dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="'header.search' | translate"
          (click)="$event.stopPropagation()"
        >
          <div
            class="flex items-center gap-3 px-4 h-12 border-b border-ct-border"
            style="background: var(--bg-body)"
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="stroke-width: 1.5; color: var(--text-muted)"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              ></path>
            </svg>
            <input
              #searchInput
              type="text"
              [(ngModel)]="query"
              (ngModelChange)="onQueryChange()"
              (keydown)="onInputKeydown($event)"
              class="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
              style="color: var(--text-primary)"
              [placeholder]="'commandPalette.placeholder' | translate"
              autocomplete="off"
              spellcheck="false"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-palette-list"
              [attr.aria-activedescendant]="activeId()"
            />
            <kbd class="text-[10px] border border-ct-border rounded px-1.5 py-0.5 text-gray-500">
              ESC
            </kbd>
          </div>

          <div class="max-h-[50vh] overflow-y-auto py-1" id="command-palette-list" role="listbox">
            @if (results.length === 0) {
              <div
                class="flex flex-col items-center justify-center px-4 py-10 text-center"
                style="color: var(--text-muted)"
              >
                <svg
                  class="w-8 h-8 mb-2 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style="stroke-width: 1.2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  ></path>
                </svg>
                <p class="text-sm">{{ 'commandPalette.empty' | translate }}</p>
              </div>
            } @else {
              <ul class="list-none">
                @for (cmd of results; track cmd.id; let i = $index) {
                  <li>
                    <button
                      type="button"
                      role="option"
                      [id]="'cp-option-' + i"
                      [attr.aria-selected]="i === activeIndex"
                      (click)="runCommand(cmd)"
                      (mouseenter)="setActive(i)"
                      [class.ct-cp-row--active]="i === activeIndex"
                      class="ct-cp-row"
                    >
                      <svg
                        class="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style="stroke-width: 1.5; color: var(--text-muted)"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          [attr.d]="cmd.icon || defaultIcon"
                        ></path>
                      </svg>
                      <span class="flex-1 text-left truncate" style="color: var(--text-primary)">
                        {{ cmd.label }}
                      </span>
                      <span class="text-[11px]" style="color: var(--text-muted)">
                        {{ cmd.section }}
                      </span>
                    </button>
                  </li>
                }
              </ul>
            }
          </div>

          <div
            class="flex items-center justify-between px-4 py-2 border-t border-ct-border text-[11px]"
            style="color: var(--text-muted); background: var(--bg-body)"
          >
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <kbd class="border border-ct-border rounded px-1">↑</kbd>
                <kbd class="border border-ct-border rounded px-1">↓</kbd>
                {{ 'commandPalette.navigate' | translate }}
              </span>
              <span class="flex items-center gap-1">
                <kbd class="border border-ct-border rounded px-1">↵</kbd>
                {{ 'commandPalette.select' | translate }}
              </span>
            </span>
            <span>{{ results.length }} {{ 'commandPalette.results' | translate }}</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .ct-cp-backdrop {
        animation: ct-cp-fade 120ms ease;
      }
      .ct-cp-dialog {
        animation: ct-cp-scale 160ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes ct-cp-fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes ct-cp-scale {
        from {
          opacity: 0;
          transform: scale(0.96) translateY(-8px);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      .ct-cp-row {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        width: 100%;
        padding: 0.5rem 1rem;
        font-size: 0.8125rem;
        background: transparent;
        border: 0;
        cursor: pointer;
        transition: background-color 80ms ease;
      }
      .ct-cp-row:focus-visible {
        outline: none;
      }
      .ct-cp-row--active {
        background: var(--surface-elevated, #f3f4f6);
      }
    `
  ]
})
export class CommandPaletteComponent implements OnChanges {
  @Input() public isOpen = false;
  @Output() public readonly closed = new EventEmitter<void>();

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  public query = '';
  public results: ICommand[] = [];
  public activeIndex = 0;
  public readonly defaultIcon =
    'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15';

  private readonly router = inject(Router);
  private readonly sidebarMenu = inject(SidebarMenuService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private previouslyFocused: HTMLElement | null = null;
  private commands: ICommand[] = [];

  constructor() {
    this.sidebarMenu.menuConfig$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(config => {
        this.commands = config ? this.flattenMenu(config) : [];
        this.recomputeResults();
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen']) return;
    if (this.isOpen) {
      this.previouslyFocused =
        typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null;
      this.query = '';
      this.activeIndex = 0;
      this.recomputeResults();
      queueMicrotask(() => this.searchInput?.nativeElement.focus());
    } else if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      this.previouslyFocused.focus();
      this.previouslyFocused = null;
    }
  }

  public close(): void {
    this.closed.emit();
  }

  public onQueryChange(): void {
    this.activeIndex = 0;
    this.recomputeResults();
  }

  public setActive(index: number): void {
    this.activeIndex = index;
    this.cdr.markForCheck();
  }

  public runCommand(cmd: ICommand): void {
    this.router.navigateByUrl(cmd.route);
    this.close();
  }

  public activeId(): string | null {
    return this.results.length > 0 ? 'cp-option-' + this.activeIndex : null;
  }

  public onInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.results.length > 0) {
          this.activeIndex = (this.activeIndex + 1) % this.results.length;
          this.scrollActiveIntoView();
          this.cdr.markForCheck();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.results.length > 0) {
          this.activeIndex =
            (this.activeIndex - 1 + this.results.length) % this.results.length;
          this.scrollActiveIntoView();
          this.cdr.markForCheck();
        }
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex = 0;
        this.scrollActiveIntoView();
        this.cdr.markForCheck();
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex = Math.max(0, this.results.length - 1);
        this.scrollActiveIntoView();
        this.cdr.markForCheck();
        break;
      case 'Enter': {
        event.preventDefault();
        const target = this.results[this.activeIndex];
        if (target) this.runCommand(target);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  @HostListener('document:keydown.escape')
  public onDocumentEscape(): void {
    if (this.isOpen) this.close();
  }

  private flattenMenu(config: IMenuConfig): ICommand[] {
    const out: ICommand[] = [];
    const walk = (items: IMenuItem[], section: string): void => {
      for (const item of items) {
        if (item.type === 'divider' || item.action) continue;
        if (item.route && item.label) {
          out.push({
            id: item.id || item.route,
            label: item.label,
            route: item.route,
            section: this.sectionLabel(item, section),
            icon: item.icon
          });
        }
        if (item.children?.length) {
          walk(item.children, item.label || section);
        }
      }
    };
    walk(config.menuItems || [], 'Navigation');
    return out;
  }

  private sectionLabel(item: IMenuItem, fallback: string): string {
    switch (item.category) {
      case 'administrative':
      case 'settings':
        return 'Administration';
      case 'analytics':
        return 'Analytics';
      case 'forms':
      case 'core':
        return 'Operations';
      default:
        return fallback;
    }
  }

  private recomputeResults(): void {
    const q = this.query.trim().toLowerCase();
    if (!q) {
      this.results = this.commands.slice(0, 12);
    } else {
      const scored: { cmd: ICommand; score: number }[] = [];
      for (const cmd of this.commands) {
        const label = cmd.label.toLowerCase();
        const section = cmd.section.toLowerCase();
        let score = -1;
        if (label.startsWith(q)) score = 3;
        else if (label.includes(q)) score = 2;
        else if (section.includes(q)) score = 1;
        if (score >= 0) scored.push({ cmd, score });
      }
      scored.sort((a, b) => b.score - a.score || a.cmd.label.localeCompare(b.cmd.label));
      this.results = scored.map(s => s.cmd);
    }
    if (this.activeIndex >= this.results.length) this.activeIndex = 0;
    this.cdr.markForCheck();
  }

  private scrollActiveIntoView(): void {
    queueMicrotask(() => {
      const el = document.getElementById('cp-option-' + this.activeIndex);
      el?.scrollIntoView({ block: 'nearest' });
    });
  }
}
