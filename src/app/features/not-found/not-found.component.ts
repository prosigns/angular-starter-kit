import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule, TranslateModule],
  template: `
    <section class="udv">
      <div class="udv__card">
        <div class="udv__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        <span class="udv__eyebrow">{{ 'notFound.eyebrow' | translate }}</span>
        <h1 class="udv__title">{{ 'notFound.title' | translate }}</h1>
        <p class="udv__message">{{ 'notFound.message' | translate }}</p>

        @if (requestedPath) {
          <div class="udv__path" title="{{ requestedPath }}">
            <span class="udv__path-label">{{ 'notFound.requestedPath' | translate }}</span>
            <code class="udv__path-value">{{ requestedPath }}</code>
          </div>
        }

        <div class="udv__progress" aria-hidden="true">
          <span></span>
        </div>

        <div class="udv__actions">
          <button type="button" class="btn btn-primary" (click)="goBack()">
            {{ 'notFound.goBack' | translate }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="goHome()">
            {{ 'notFound.backToHome' | translate }}
          </button>
          <a routerLink="/contact" class="btn btn-ghost">
            {{ 'notFound.contactSupport' | translate }}
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .udv {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: var(--space-6);
        background:
          radial-gradient(circle at 20% 10%, rgba(59, 130, 246, 0.06), transparent 45%),
          radial-gradient(circle at 85% 85%, rgba(15, 118, 110, 0.05), transparent 45%),
          var(--bg-body);
      }

      .udv__card {
        position: relative;
        width: 100%;
        max-width: 520px;
        padding: var(--space-10) var(--space-8);
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        text-align: center;
      }

      .udv__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        margin-bottom: var(--space-5);
        color: var(--primary);
        background: var(--primary-50);
        border: 1px solid var(--primary-100);
        border-radius: var(--radius-full);
      }

      .udv__icon svg {
        animation: udv-spin 6s linear infinite;
      }

      .udv__eyebrow {
        display: inline-block;
        padding: 2px 8px;
        margin-bottom: var(--space-3);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--warning-700);
        background: var(--warning-50);
        border: 1px solid var(--warning-200);
        border-radius: var(--radius-full);
      }

      .udv__title {
        margin: 0 0 var(--space-3);
        font-size: 22px;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: var(--text-primary);
      }

      .udv__message {
        margin: 0 auto var(--space-6);
        max-width: 420px;
        font-size: 14px;
        line-height: 1.6;
        color: var(--text-secondary);
      }

      .udv__path {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        max-width: 100%;
        margin-bottom: var(--space-6);
        padding: 6px 10px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
      }

      .udv__path-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
      }

      .udv__path-value {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 280px;
      }

      .udv__progress {
        height: 3px;
        width: 100%;
        margin-bottom: var(--space-6);
        background: var(--bg-elevated);
        border-radius: var(--radius-full);
        overflow: hidden;
      }

      .udv__progress span {
        display: block;
        width: 40%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          var(--primary-light),
          transparent
        );
        animation: udv-slide 1.8s ease-in-out infinite;
      }

      .udv__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        justify-content: center;
      }

      .udv__actions .btn {
        text-decoration: none;
      }

      @keyframes udv-spin {
        to { transform: rotate(360deg); }
      }

      @keyframes udv-slide {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }

      @media (prefers-reduced-motion: reduce) {
        .udv__icon svg,
        .udv__progress span {
          animation: none;
        }
      }

      @media (max-width: 480px) {
        .udv__card {
          padding: var(--space-8) var(--space-5);
        }
        .udv__actions {
          flex-direction: column;
        }
        .udv__actions .btn {
          width: 100%;
        }
      }
    `
  ]
})
export class NotFoundComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly requestedPath = this.router.url && this.router.url !== '/' ? this.router.url : '';

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    const target = this.authService.isAuthenticated() ? '/system/dashboard' : '/auth/login';
    this.router.navigateByUrl(target);
  }
}
