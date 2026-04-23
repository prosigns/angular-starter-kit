import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface IBarChartSeries {
  name: string;
  color: string;
  values: number[];
}

export interface IBarChartData {
  categories: string[];
  series: IBarChartSeries[];
}

@Component({
  selector: 'app-sa-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sa-bar">
      <div class="sa-bar__legend" role="list">
        @for (s of data().series; track s.name) {
          <span class="sa-bar__legend-item" role="listitem">
            <span class="sa-bar__swatch" [style.background]="s.color" aria-hidden="true"></span>
            {{ s.name }}
          </span>
        }
      </div>

      <svg
        [attr.viewBox]="'0 0 ' + width + ' ' + height"
        preserveAspectRatio="none"
        class="sa-bar__svg"
        role="img"
        [attr.aria-label]="ariaSummary()"
      >
        <!-- Gridlines & y-axis labels -->
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
            class="sa-bar__axis"
          >
            {{ tick.label }}
          </text>
        }

        <!-- Bars -->
        @for (group of groups(); track group.label) {
          <g>
            @for (bar of group.bars; track bar.name) {
              <rect
                [attr.x]="bar.x"
                [attr.y]="bar.y"
                [attr.width]="bar.w"
                [attr.height]="bar.h"
                [attr.fill]="bar.color"
                rx="2"
              >
                <title>{{ group.label }} — {{ bar.name }}: {{ bar.value }}</title>
              </rect>
            }
            <text
              [attr.x]="group.centerX"
              [attr.y]="height - 8"
              text-anchor="middle"
              class="sa-bar__axis"
            >
              {{ group.label }}
            </text>
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
      .sa-bar {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        min-height: 240px;
      }
      .sa-bar__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.875rem;
        padding: 0 0 0.75rem;
        font-size: 0.75rem;
        color: #475569;
      }
      .sa-bar__legend-item {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
      }
      .sa-bar__swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
      }
      .sa-bar__svg {
        flex: 1;
        width: 100%;
        display: block;
      }
      .sa-bar__axis {
        font-size: 10px;
        fill: #94a3b8;
        font-family: inherit;
      }
    `
  ]
})
export class SaBarChartComponent {
  public readonly data = input.required<IBarChartData>();

  public readonly width = 640;
  public readonly height = 260;
  public readonly padLeft = 40;
  public readonly padRight = 12;
  public readonly padTop = 16;
  public readonly padBottom = 28;
  public readonly groupGapRatio = 0.28;
  public readonly barGap = 3;

  public readonly maxValue = computed(() => {
    const d = this.data();
    const all = d.series.flatMap(s => s.values);
    const raw = all.length ? Math.max(...all) : 1;
    return this.niceCeil(raw);
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

  public readonly groups = computed(() => {
    const d = this.data();
    const max = this.maxValue() || 1;
    const innerW = this.width - this.padLeft - this.padRight;
    const innerH = this.height - this.padTop - this.padBottom;
    const categories = d.categories;
    const seriesCount = d.series.length;
    const groupCount = categories.length || 1;

    const groupWidth = innerW / groupCount;
    const groupPadding = groupWidth * this.groupGapRatio;
    const innerGroupWidth = groupWidth - groupPadding;
    const barWidth = Math.max(
      2,
      (innerGroupWidth - this.barGap * (seriesCount - 1)) / Math.max(1, seriesCount)
    );

    return categories.map((label, gi) => {
      const groupLeft = this.padLeft + gi * groupWidth + groupPadding / 2;
      const bars = d.series.map((s, si) => {
        const value = s.values[gi] ?? 0;
        const h = (value / max) * innerH;
        return {
          name: s.name,
          value,
          color: s.color,
          x: groupLeft + si * (barWidth + this.barGap),
          y: this.padTop + innerH - h,
          w: barWidth,
          h
        };
      });
      return {
        label,
        bars,
        centerX: groupLeft + innerGroupWidth / 2
      };
    });
  });

  public readonly ariaSummary = computed(() => {
    const d = this.data();
    const names = d.series.map(s => s.name).join(', ');
    return `Grouped bar chart showing ${names} across ${d.categories.length} categories`;
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
