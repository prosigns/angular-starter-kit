import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="card card-compact flex flex-col justify-center"
      style="height: var(--space-12, 72px)"
    >
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-table-header uppercase mb-1"
            style="color: var(--text-muted); font-size: 12px; letter-spacing: 0.05em"
          >
            {{ label() }}
          </p>
          <div class="flex items-baseline gap-2">
            <span class="text-stat" style="color: var(--text-primary)">{{ value() }}</span>
            @if (trend()) {
              <span
                [class]="
                  'text-caption font-medium ' +
                  (trendDirection() === 'up' ? 'text-success-700' : 'text-danger-700')
                "
              >
                {{ trendDirection() === 'up' ? '▲' : '▼' }} {{ trend() }}
              </span>
            }
          </div>
        </div>
        @if (subtitle()) {
          <p class="text-caption" style="color: var(--text-muted)">{{ subtitle() }}</p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class KpiCardComponent {
  public readonly label = input<string>('');
  public readonly value = input<string | number>('');
  public readonly trend = input<string>('');
  public readonly trendDirection = input<'up' | 'down'>('up');
  public readonly subtitle = input<string>('');
}
