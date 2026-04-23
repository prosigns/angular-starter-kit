import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface IAreaChartPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-sa-area-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sa-area" role="img" [attr.aria-label]="ariaSummary()">
      <svg
        [attr.viewBox]="'0 0 ' + width + ' ' + height"
        preserveAspectRatio="none"
        class="sa-area__svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient [attr.id]="gradientId()" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [attr.stop-color]="accent()" stop-opacity="0.22" />
            <stop offset="100%" [attr.stop-color]="accent()" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Gridlines -->
        @for (y of gridYs(); track y) {
          <line
            [attr.x1]="padLeft"
            [attr.x2]="width - padRight"
            [attr.y1]="y"
            [attr.y2]="y"
            stroke="#eef2f7"
            stroke-width="1"
          />
        }

        <!-- Y-axis labels -->
        @for (tick of yTicks(); track tick.value) {
          <text
            [attr.x]="padLeft - 8"
            [attr.y]="tick.y + 3"
            text-anchor="end"
            class="sa-area__axis"
          >
            {{ tick.label }}
          </text>
        }

        <!-- X-axis labels -->
        @for (pt of mapped(); track pt.label; let i = $index) {
          <text
            [attr.x]="pt.x"
            [attr.y]="height - 8"
            text-anchor="middle"
            class="sa-area__axis"
          >
            {{ pt.label }}
          </text>
        }

        <!-- Filled area -->
        <path [attr.d]="areaPath()" [attr.fill]="'url(#' + gradientId() + ')'" />

        <!-- Line -->
        <path
          [attr.d]="linePath()"
          fill="none"
          [attr.stroke]="accent()"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <!-- Points -->
        @for (pt of mapped(); track pt.label) {
          <g>
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3.5" [attr.fill]="accent()" />
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="8" fill="transparent">
              <title>{{ pt.label }}: {{ pt.value }}</title>
            </circle>
          </g>
        }
      </svg>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .sa-area {
        width: 100%;
        height: 100%;
        min-height: 240px;
      }
      .sa-area__svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .sa-area__axis {
        font-size: 10px;
        fill: #94a3b8;
        font-family: inherit;
      }
    `
  ]
})
export class SaAreaChartComponent {
  public readonly data = input.required<IAreaChartPoint[]>();
  public readonly accent = input<string>('#2563eb');
  public readonly idSuffix = input<string>('area');

  public readonly width = 640;
  public readonly height = 280;
  public readonly padLeft = 40;
  public readonly padRight = 12;
  public readonly padTop = 16;
  public readonly padBottom = 28;

  public readonly gradientId = computed(() => `sa-area-grad-${this.idSuffix()}`);

  public readonly maxValue = computed(() => {
    const values = this.data().map(d => d.value);
    const raw = values.length ? Math.max(...values) : 1;
    return this.niceCeil(raw);
  });

  public readonly mapped = computed(() => {
    const pts = this.data();
    const max = this.maxValue() || 1;
    const innerW = this.width - this.padLeft - this.padRight;
    const innerH = this.height - this.padTop - this.padBottom;
    const step = pts.length > 1 ? innerW / (pts.length - 1) : 0;

    return pts.map((p, i) => ({
      label: p.label,
      value: p.value,
      x: this.padLeft + i * step,
      y: this.padTop + innerH - (p.value / max) * innerH
    }));
  });

  public readonly linePath = computed(() => {
    const pts = this.mapped();
    if (!pts.length) return '';
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
  });

  public readonly areaPath = computed(() => {
    const pts = this.mapped();
    if (!pts.length) return '';
    const innerBottom = this.height - this.padBottom;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const line = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
    return `${line} L ${last.x.toFixed(2)} ${innerBottom} L ${first.x.toFixed(2)} ${innerBottom} Z`;
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

  public readonly gridYs = computed(() => this.yTicks().map(t => t.y));

  public readonly ariaSummary = computed(() => {
    const pts = this.data();
    if (!pts.length) return 'No data available';
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `Trend from ${first.label} (${first.value}) to ${last.label} (${last.value})`;
  });

  private niceCeil(n: number): number {
    if (n <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(n)));
    const normalized = n / mag;
    const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return nice * mag;
  }

  private formatTick(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
    return `${n}`;
  }
}
