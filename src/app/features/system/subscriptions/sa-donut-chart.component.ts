import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface IDonutSlice {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-sa-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sa-dn">
      <div class="sa-dn__chart">
        <svg
          [attr.viewBox]="'0 0 ' + size + ' ' + size"
          class="sa-dn__svg"
          role="img"
          [attr.aria-label]="ariaSummary()"
        >
          @if (!total()) {
            <circle
              [attr.cx]="center"
              [attr.cy]="center"
              [attr.r]="radius"
              fill="none"
              stroke="#e2e8f0"
              [attr.stroke-width]="thickness"
            />
          }
          @for (seg of segments(); track seg.name) {
            <path
              [attr.d]="seg.path"
              fill="none"
              [attr.stroke]="seg.color"
              [attr.stroke-width]="thickness"
              stroke-linecap="butt"
            >
              <title>{{ seg.name }}: {{ seg.value }} ({{ seg.pct }}%)</title>
            </path>
          }
          <text
            [attr.x]="center"
            [attr.y]="center - 4"
            text-anchor="middle"
            class="sa-dn__center-value"
          >
            {{ total() }}
          </text>
          <text
            [attr.x]="center"
            [attr.y]="center + 14"
            text-anchor="middle"
            class="sa-dn__center-label"
          >
            {{ centerLabel() }}
          </text>
        </svg>
      </div>

      <ul class="sa-dn__legend" role="list">
        @for (s of withPct(); track s.name) {
          <li class="sa-dn__legend-item">
            <span class="sa-dn__swatch" [style.background]="s.color" aria-hidden="true"></span>
            <span class="sa-dn__legend-label">{{ s.name }}</span>
            <span class="sa-dn__legend-value">{{ s.value }} · {{ s.pct }}%</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .sa-dn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        width: 100%;
        height: 100%;
      }
      .sa-dn__chart {
        flex: 0 0 auto;
        width: 200px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sa-dn__svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .sa-dn__center-value {
        font-size: 28px;
        font-weight: 700;
        fill: #0f172a;
      }
      .sa-dn__center-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        fill: #64748b;
      }
      .sa-dn__legend {
        flex: 1;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        min-width: 0;
        max-width: 220px;
      }
      .sa-dn__legend-item {
        display: grid;
        grid-template-columns: 10px 1fr auto;
        align-items: center;
        gap: 0.625rem;
        padding: 0.375rem 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.8125rem;
      }
      .sa-dn__legend-item:last-child { border-bottom: 0; }
      .sa-dn__swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
      }
      .sa-dn__legend-label {
        color: #334155;
        font-weight: 500;
      }
      .sa-dn__legend-value {
        color: #64748b;
        font-size: 0.75rem;
        font-variant-numeric: tabular-nums;
      }

      @media (max-width: 640px) {
        .sa-dn {
          flex-direction: column;
          align-items: stretch;
        }
        .sa-dn__chart {
          align-self: center;
        }
      }
    `
  ]
})
export class SaDonutChartComponent {
  public readonly data = input.required<IDonutSlice[]>();
  public readonly centerLabel = input<string>('Active');

  public readonly size = 160;
  public readonly thickness = 22;
  public readonly center = this.size / 2;
  public readonly radius = this.center - this.thickness / 2 - 2;

  public readonly total = computed(() =>
    this.data().reduce((sum, s) => sum + s.value, 0)
  );

  public readonly withPct = computed(() => {
    const total = this.total() || 1;
    return this.data().map(s => ({
      ...s,
      pct: Math.round((s.value / total) * 100)
    }));
  });

  public readonly segments = computed(() => {
    const data = this.data();
    const total = this.total();
    if (!total) return [];

    let startAngle = -Math.PI / 2; // start at 12 o'clock
    const gap = data.length > 1 ? 0.02 : 0;

    return data
      .filter(s => s.value > 0)
      .map(s => {
        const share = s.value / total;
        const angle = share * (2 * Math.PI);
        const endAngle = startAngle + angle;
        const path = this.arcPath(startAngle + gap / 2, endAngle - gap / 2);
        const result = {
          name: s.name,
          color: s.color,
          value: s.value,
          pct: Math.round(share * 100),
          path
        };
        startAngle = endAngle;
        return result;
      });
  });

  public readonly ariaSummary = computed(() =>
    `Donut chart: ${this.withPct()
      .map(s => `${s.name} ${s.pct}%`)
      .join(', ')}`
  );

  private arcPath(start: number, end: number): string {
    const r = this.radius;
    const cx = this.center;
    const cy = this.center;

    // Full circle as two half arcs to avoid degeneracy
    if (end - start >= 2 * Math.PI - 1e-4) {
      return [
        `M ${cx + r} ${cy}`,
        `A ${r} ${r} 0 1 1 ${cx - r} ${cy}`,
        `A ${r} ${r} 0 1 1 ${cx + r} ${cy}`
      ].join(' ');
    }

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
  }
}
