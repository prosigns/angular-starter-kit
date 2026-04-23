import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface IStackedSeries {
  name: string;
  color: string;
  values: number[];
}

export interface IStackedAreaData {
  categories: string[];
  series: IStackedSeries[];
}

@Component({
  selector: 'app-sa-stacked-area-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sa-stk">
      <div class="sa-stk__legend" role="list">
        @for (s of data().series; track s.name) {
          <span class="sa-stk__legend-item" role="listitem">
            <span class="sa-stk__swatch" [style.background]="s.color" aria-hidden="true"></span>
            {{ s.name }}
          </span>
        }
      </div>

      <svg
        [attr.viewBox]="'0 0 ' + width + ' ' + height"
        preserveAspectRatio="none"
        class="sa-stk__svg"
        role="img"
        [attr.aria-label]="ariaSummary()"
      >
        <!-- Gridlines & Y-axis labels -->
        @for (tick of yTicks(); track tick.value) {
          <line
            [attr.x1]="padLeft"
            [attr.x2]="width - padRight"
            [attr.y1]="tick.y"
            [attr.y2]="tick.y"
            stroke="#eef2f7"
            stroke-width="1"
          />
          <text
            [attr.x]="padLeft - 8"
            [attr.y]="tick.y + 3"
            text-anchor="end"
            class="sa-stk__axis"
          >
            {{ tick.label }}
          </text>
        }

        <!-- Stacked areas (bottom to top) -->
        @for (band of bands(); track band.name) {
          <path [attr.d]="band.path" [attr.fill]="band.color" fill-opacity="0.85" />
        }

        <!-- X-axis labels -->
        @for (x of xLabels(); track x.label) {
          <text
            [attr.x]="x.x"
            [attr.y]="height - 8"
            text-anchor="middle"
            class="sa-stk__axis"
          >
            {{ x.label }}
          </text>
        }
      </svg>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sa-stk {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        min-height: 260px;
      }
      .sa-stk__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.875rem;
        padding: 0 0 0.75rem;
        font-size: 0.75rem;
        color: #475569;
      }
      .sa-stk__legend-item {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
      }
      .sa-stk__swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
      }
      .sa-stk__svg {
        flex: 1;
        width: 100%;
        display: block;
      }
      .sa-stk__axis {
        font-size: 10px;
        fill: #94a3b8;
        font-family: inherit;
      }
    `
  ]
})
export class SaStackedAreaChartComponent {
  public readonly data = input.required<IStackedAreaData>();

  public readonly width = 640;
  public readonly height = 280;
  public readonly padLeft = 48;
  public readonly padRight = 12;
  public readonly padTop = 16;
  public readonly padBottom = 28;

  private readonly totals = computed(() => {
    const d = this.data();
    return d.categories.map((_, i) =>
      d.series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0)
    );
  });

  public readonly maxValue = computed(() => {
    const t = this.totals();
    return this.niceCeil(t.length ? Math.max(...t) : 1);
  });

  public readonly yTicks = computed(() => {
    const max = this.maxValue() || 1;
    const steps = 4;
    const innerH = this.height - this.padTop - this.padBottom;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = Math.round((max * i) / steps);
      const y = this.padTop + innerH - (value / max) * innerH;
      return { value, y, label: this.formatTick(value) };
    });
  });

  public readonly xLabels = computed(() => {
    const d = this.data();
    const innerW = this.width - this.padLeft - this.padRight;
    const step = d.categories.length > 1 ? innerW / (d.categories.length - 1) : 0;
    return d.categories.map((label, i) => ({
      label,
      x: this.padLeft + i * step
    }));
  });

  public readonly bands = computed(() => {
    const d = this.data();
    const max = this.maxValue() || 1;
    const innerW = this.width - this.padLeft - this.padRight;
    const innerH = this.height - this.padTop - this.padBottom;
    const step = d.categories.length > 1 ? innerW / (d.categories.length - 1) : 0;
    const baseY = this.padTop + innerH;

    const running = new Array(d.categories.length).fill(0);

    return d.series.map(s => {
      const top = d.categories.map((_, i) => {
        const v = running[i] + (s.values[i] ?? 0);
        return { x: this.padLeft + i * step, y: baseY - (v / max) * innerH, cumulative: v };
      });
      const bottom = d.categories.map((_, i) => ({
        x: this.padLeft + i * step,
        y: baseY - (running[i] / max) * innerH
      }));

      // Update running totals for next band
      top.forEach((pt, i) => (running[i] = pt.cumulative));

      const topPath = top
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');
      const bottomPath = [...bottom]
        .reverse()
        .map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');

      return {
        name: s.name,
        color: s.color,
        path: `${topPath} ${bottomPath} Z`
      };
    });
  });

  public readonly ariaSummary = computed(() => {
    const d = this.data();
    const names = d.series.map(s => s.name).join(', ');
    return `Stacked area chart of ${names} across ${d.categories.length} periods`;
  });

  private niceCeil(n: number): number {
    if (n <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(n)));
    const normalized = n / mag;
    const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return nice * mag;
  }

  private formatTick(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
    return `$${n}`;
  }
}
