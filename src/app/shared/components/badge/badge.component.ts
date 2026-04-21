import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'active';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'badge badge-' + variant()">
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
    `
  ]
})
export class BadgeComponent {
  public readonly variant = input<BadgeVariant>('neutral');
}
