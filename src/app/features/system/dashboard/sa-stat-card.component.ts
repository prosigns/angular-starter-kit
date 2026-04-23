import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sa-stat-card',
  standalone: true,
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="route()"
      class="sa-stat"
      [style.--sa-accent]="accent()"
      [attr.aria-label]="label() + ': ' + value()"
    >
      <span class="sa-stat__accent" aria-hidden="true"></span>

      <span class="sa-stat__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="iconPath()"></path>
        </svg>
      </span>

      <div class="sa-stat__body">
        <p class="sa-stat__label">{{ label() }}</p>
        <div class="sa-stat__row">
          <span class="sa-stat__value">{{ value() }}</span>
          @if (trend()) {
            <span
              class="sa-stat__trend"
              [class.sa-stat__trend--up]="trendDirection() === 'up'"
              [class.sa-stat__trend--down]="trendDirection() === 'down'"
            >
              {{ trendDirection() === 'up' ? '▲' : '▼' }} {{ trend() }}
            </span>
          }
        </div>
        @if (subtitle()) {
          <p class="sa-stat__subtitle">{{ subtitle() }}</p>
        }
      </div>

      <svg
        class="sa-stat__chev"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m9 5 7 7-7 7" />
      </svg>
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sa-stat {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 1rem 1.125rem 1rem 1.25rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        text-decoration: none;
        min-height: 104px;
        transition: box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease;
        overflow: hidden;
      }
      .sa-stat:hover {
        border-color: color-mix(in srgb, var(--sa-accent) 35%, #e2e8f0);
        box-shadow: 0 6px 18px -8px rgba(15, 23, 42, 0.18);
      }
      .sa-stat:focus-visible {
        outline: 2px solid var(--sa-accent);
        outline-offset: 2px;
      }
      .sa-stat__accent {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--sa-accent);
      }
      .sa-stat__icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: var(--sa-accent);
        background: color-mix(in srgb, var(--sa-accent) 10%, transparent);
      }
      .sa-stat__icon svg {
        width: 22px;
        height: 22px;
      }
      .sa-stat__body {
        flex: 1;
        min-width: 0;
      }
      .sa-stat__label {
        margin: 0;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #64748b;
      }
      .sa-stat__row {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }
      .sa-stat__value {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.1;
        color: #0f172a;
        letter-spacing: -0.01em;
      }
      .sa-stat__trend {
        font-size: 0.75rem;
        font-weight: 600;
      }
      .sa-stat__trend--up   { color: #059669; }
      .sa-stat__trend--down { color: #dc2626; }
      .sa-stat__subtitle {
        margin: 0.25rem 0 0;
        font-size: 0.75rem;
        color: #64748b;
      }
      .sa-stat__chev {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        color: #cbd5e1;
        transition: color 160ms ease, transform 160ms ease;
      }
      .sa-stat:hover .sa-stat__chev {
        color: var(--sa-accent);
        transform: translateX(2px);
      }
    `
  ]
})
export class SaStatCardComponent {
  public readonly label = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly iconPath = input.required<string>();
  public readonly accent = input<string>('#2563eb');
  public readonly trend = input<string>('');
  public readonly trendDirection = input<'up' | 'down'>('up');
  public readonly subtitle = input<string>('');
  public readonly route = input<string | null>(null);
}
