import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  inject
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IMenuItem } from '../../../core/services/sidebar-menu.service';

const VIEWPORT_PADDING_PX = 8;

@Component({
  selector: 'app-sidebar-flyout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible) {
      <div
        #flyoutContainer
        class="fixed z-50 bg-[#041643] border border-[#0a245e] rounded-lg shadow-2xl min-w-52 py-1 backdrop-blur-sm ct-flyout-animate"
        [style.left.px]="clampedPosition.x"
        [style.top.px]="clampedPosition.y"
        style="box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);"
        data-flyout="true"
        [attr.id]="flyoutId"
        role="menu"
        tabindex="-1"
        (keydown)="onKeydown($event)"
      >
        <div
          class="px-4 py-3 text-xs font-semibold text-white border-b border-[#0a245e] bg-[#0a245e]/60"
        >
          <svg
            class="w-4 h-4 mr-2 text-[#FFA931] inline-block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              [attr.d]="parentMenuItem?.icon"
            ></path>
          </svg>
          {{ parentMenuItem?.label }}
        </div>

        <div class="py-1">
          @for (item of subMenuItems; track item.id || item.route || $index) {
            <a
              #flyoutItem
              [routerLink]="item.route"
              (click)="onItemClick(item)"
              (keydown.enter)="onItemClick(item)"
              (keydown.space)="onItemClick(item)"
              [attr.aria-label]="('sidebar.navigateTo' | translate) + ' ' + item.label"
              class="flex items-center px-4 py-3 text-xs text-white/85 hover:bg-[#0a245e] hover:text-white transition-all duration-200 group border-l-2 border-transparent hover:border-[#FFA931] focus:outline-none focus:bg-[#0a245e] focus:text-white"
              role="menuitem"
            >
              <svg
                class="w-4 h-4 mr-3 text-white/65 group-hover:text-white transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  [attr.d]="item.icon"
                ></path>
              </svg>
              <span class="font-medium">{{ item.label }}</span>
            </a>
          }
        </div>

        <div
          class="absolute left-0 top-4 transform -translate-x-1 w-2 h-2 bg-[#041643] border-l border-t border-[#0a245e] rotate-45"
        ></div>
      </div>

      <button
        type="button"
        class="fixed inset-0 z-40"
        (click)="closeFlyout()"
        [attr.aria-label]="'sidebar.closeSidebar' | translate"
      ></button>
    }
  `,
  styles: [
    `
      .ct-flyout-animate {
        animation: ct-flyout-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes ct-flyout-in {
        from {
          opacity: 0;
          transform: translateX(-8px) translateY(-4px) scale(0.92);
          filter: blur(1px);
        }
        to {
          opacity: 1;
          transform: none;
          filter: blur(0);
        }
      }
    `
  ]
})
export class SidebarFlyoutComponent implements OnChanges {
  @Input() public isVisible = false;
  @Input() public parentMenuItem: IMenuItem | null = null;
  @Input() public subMenuItems: IMenuItem[] = [];
  @Input() public position: { x: number; y: number } = { x: 0, y: 0 };
  @Input() public flyoutId: string | null = null;

  @Output() public readonly itemSelected = new EventEmitter<IMenuItem>();
  @Output() public readonly flyoutClosed = new EventEmitter<void>();

  @ViewChild('flyoutContainer') private flyoutContainer?: ElementRef<HTMLDivElement>;
  @ViewChildren('flyoutItem') private flyoutItems?: QueryList<ElementRef<HTMLAnchorElement>>;

  public clampedPosition: { x: number; y: number } = { x: 0, y: 0 };

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.isVisible) this.recomputeClampedPosition();
        });
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['position'] || changes['isVisible']) {
      this.recomputeClampedPosition();
    }

    if (changes['isVisible']) {
      if (this.isVisible) {
        this.previouslyFocused =
          typeof document !== 'undefined' ? (document.activeElement as HTMLElement) : null;
        queueMicrotask(() => this.focusFirstItem());
      } else if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    }
  }

  public onItemClick(item: IMenuItem): void {
    this.itemSelected.emit(item);
    this.closeFlyout();
  }

  public closeFlyout(): void {
    this.flyoutClosed.emit();
  }

  public onKeydown(event: KeyboardEvent): void {
    const items = this.getItemElements();
    if (!items.length) return;

    const activeIndex = items.findIndex(el => el === document.activeElement);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        items[(activeIndex + 1 + items.length) % items.length].focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        items[(activeIndex - 1 + items.length) % items.length].focus();
        break;
      }
      case 'Home': {
        event.preventDefault();
        items[0].focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        items[items.length - 1].focus();
        break;
      }
      case 'Tab': {
        event.preventDefault();
        const step = event.shiftKey ? -1 : 1;
        items[(activeIndex + step + items.length) % items.length].focus();
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.closeFlyout();
        break;
      }
    }
  }

  private recomputeClampedPosition(): void {
    if (typeof window === 'undefined') {
      this.clampedPosition = { ...this.position };
      return;
    }

    const estimatedWidth = this.flyoutContainer?.nativeElement.offsetWidth ?? 208;
    const estimatedHeight = this.flyoutContainer?.nativeElement.offsetHeight ?? 240;

    const maxX = Math.max(
      VIEWPORT_PADDING_PX,
      window.innerWidth - estimatedWidth - VIEWPORT_PADDING_PX
    );
    const maxY = Math.max(
      VIEWPORT_PADDING_PX,
      window.innerHeight - estimatedHeight - VIEWPORT_PADDING_PX
    );

    this.clampedPosition = {
      x: Math.max(VIEWPORT_PADDING_PX, Math.min(this.position.x, maxX)),
      y: Math.max(VIEWPORT_PADDING_PX, Math.min(this.position.y, maxY))
    };
    this.cdr.markForCheck();
  }

  private focusFirstItem(): void {
    this.recomputeClampedPosition();
    const first = this.getItemElements()[0];
    if (first) first.focus();
    else this.flyoutContainer?.nativeElement.focus();
  }

  private getItemElements(): HTMLAnchorElement[] {
    return this.flyoutItems?.toArray().map(ref => ref.nativeElement) ?? [];
  }
}
