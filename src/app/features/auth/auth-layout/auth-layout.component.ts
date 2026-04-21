/* eslint-disable max-len */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell">
      <!-- Left Brand Panel -->
      <div class="brand-panel">
        <!-- Geometric decoration -->
        <div class="brand-geo">
          <svg
            class="geo-rings"
            viewBox="0 0 600 600"
            preserveAspectRatio="xMinYMax slice"
            fill="none"
            aria-hidden="true"
          >
            <!-- Primary rings radiating from bottom-left -->
            <circle cx="80" cy="520" r="280" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
            <circle cx="80" cy="520" r="200" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
            <circle cx="80" cy="520" r="120" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
            <!-- Secondary ring cluster — mid area -->
            <circle cx="320" cy="380" r="100" stroke="rgba(255,255,255,0.025)" stroke-width="1" />
            <circle cx="320" cy="380" r="50" stroke="rgba(255,255,255,0.02)" stroke-width="1" />
            <!-- Accent orbs scattered upward-right -->
            <circle cx="60" cy="440" r="36" fill="rgba(59,130,246,0.10)" />
            <circle cx="200" cy="540" r="20" fill="rgba(59,130,246,0.08)" />
            <circle cx="400" cy="300" r="14" fill="rgba(59,130,246,0.12)" />
            <circle cx="520" cy="180" r="8" fill="rgba(59,130,246,0.10)" />
            <circle cx="480" cy="420" r="10" fill="rgba(59,130,246,0.06)" />
            <!-- Connection lines from origin -->
            <line
              x1="80"
              y1="520"
              x2="320"
              y2="380"
              stroke="rgba(255,255,255,0.03)"
              stroke-width="1"
              stroke-dasharray="3 6"
            />
            <line
              x1="80"
              y1="520"
              x2="400"
              y2="300"
              stroke="rgba(255,255,255,0.02)"
              stroke-width="1"
              stroke-dasharray="3 6"
            />
            <line
              x1="320"
              y1="380"
              x2="520"
              y2="180"
              stroke="rgba(255,255,255,0.02)"
              stroke-width="1"
              stroke-dasharray="3 6"
            />
            <!-- Faint outer ring — top right reach -->
            <circle cx="500" cy="100" r="60" stroke="rgba(255,255,255,0.015)" stroke-width="1" />
          </svg>
        </div>

        <!-- Content anchored bottom-left -->
        <div class="brand-content">
          <!-- Logo -->
          <div class="brand-logo">
            <svg class="logo-icon" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.12)" />
              <path
                d="M24 12C17.373 12 12 17.373 12 24s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.25 17.25l-4.5-4.5 1.59-1.59L21.6 25.92l7.41-7.41L30.6 20.1l-8.85 9.15z"
                fill="white"
              />
            </svg>
            <div>
              <h1 class="logo-text">
                Care<span class="logo-text-bold">Track</span><sup class="logo-tm">&trade;</sup>
              </h1>
              <span class="logo-badge">A Product <strong>by BPDS</strong></span>
            </div>
          </div>

          <!-- Tagline -->
          <p class="brand-tagline">
            Compliance Tracking &amp; Client Engagement for Behavioral Health Programs
          </p>

          <!-- Feature list -->
          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <span class="feature-title">Real-Time Compliance</span>
                <span class="feature-desc">Automated tracking across all programs</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06A.75.75 0 016.11 5.173L5.05 4.11a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.062-1.061l1.061-1.06a.75.75 0 011.06 0zM10 7a3 3 0 100 6 3 3 0 000-6zm-6.25 3a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zm12 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm-9.74 4.89a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.061a.75.75 0 011.06 0zm9.48 0a.75.75 0 011.06 0l1.06 1.061a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15z"
                  />
                </svg>
              </div>
              <div>
                <span class="feature-title">Smart Insights</span>
                <span class="feature-desc">AI-powered risk identification</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <span class="feature-title">HIPAA Compliant</span>
                <span class="feature-desc">42 CFR Part 2 &amp; NIST certified</span>
              </div>
            </div>
          </div>

          <!-- Trust strip -->
          <div class="brand-trust">
            <div class="trust-divider"></div>
            <div class="trust-badges">
              <span class="trust-item">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M8 1a3.5 3.5 0 00-3.5 3.5V8H4a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2h-.5V4.5A3.5 3.5 0 008 1zm2 7V4.5a2 2 0 10-4 0V8h4z"
                    clip-rule="evenodd"
                  />
                </svg>
                HIPAA
              </span>
              <span class="trust-dot"></span>
              <span class="trust-item">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M8 .5A7.77 7.77 0 005 1.334a7.75 7.75 0 00-4.878 5.06.75.75 0 000 .468A7.75 7.75 0 005 11.966a7.77 7.77 0 003 .834 7.77 7.77 0 003-.834 7.75 7.75 0 004.878-5.06.75.75 0 000-.468A7.75 7.75 0 0011 1.334 7.77 7.77 0 008 .5zm0 3a3 3 0 100 6 3 3 0 000-6z"
                  />
                </svg>
                SOC 2
              </span>
              <span class="trust-dot"></span>
              <span class="trust-item">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M8 1a.75.75 0 01.692.462L10.585 6H14.5a.75.75 0 01.451 1.349l-3.174 2.39 1.178 3.828a.75.75 0 01-1.153.835L8 11.677l-3.802 2.725a.75.75 0 01-1.153-.835l1.178-3.828L1.049 7.35A.75.75 0 011.5 6h3.915l1.893-4.538A.75.75 0 018 1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Section 508
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="form-panel">
        <div class="form-wrapper">
          <!-- Mobile-only logo -->
          <div class="mobile-logo">
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#1E40AF" />
              <path
                d="M20 10C14.477 10 10 14.477 10 20s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-1.875 14.375l-3.75-3.75 1.325-1.325L17.95 21.55l6.175-6.175L25.45 16.7l-7.325 7.675z"
                fill="white"
              />
            </svg>
            <span class="mobile-logo-text">CareTrack</span>
          </div>

          <!-- Form content -->
          <div class="form-content">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer -->
          <div class="form-footer">
            <svg class="footer-lock" viewBox="0 0 16 16" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M8 1a3.5 3.5 0 00-3.5 3.5V8H4a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2h-.5V4.5A3.5 3.5 0 008 1zm2 7V4.5a2 2 0 10-4 0V8h4z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Protected by HIPAA &amp; 42 CFR Part 2</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .auth-shell {
        display: flex;
        min-height: 100vh;
        min-height: 100dvh;
      }

      /* ─── Brand Panel (Left 60%) ─── */
      .brand-panel {
        position: relative;
        width: 60%;
        min-width: 420px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        padding-top: 48px;
        background: linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
        overflow: hidden;
      }

      .brand-geo {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .geo-rings {
        display: block;
        width: 100%;
        height: 100%;
      }

      /* Dot grid overlay */
      .brand-panel::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
          circle at 1px 1px,
          rgba(255, 255, 255, 0.035) 1px,
          transparent 0
        );
        background-size: 32px 32px;
        pointer-events: none;
        z-index: 0;
      }

      /* Bottom-left gradient glow — matches geo origin */
      .brand-panel::after {
        content: '';
        position: absolute;
        bottom: -15%;
        left: -10%;
        width: 65%;
        height: 65%;
        background: radial-gradient(
          ellipse at 30% 70%,
          rgba(59, 130, 246, 0.14) 0%,
          transparent 70%
        );
        pointer-events: none;
        z-index: 0;
      }

      /* Content: lower-left with comfortable breathing room */
      .brand-content {
        position: relative;
        z-index: 1;
        max-width: 520px;
        padding: 56px;
      }

      /* Logo */
      .brand-logo {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 28px;
      }

      .logo-icon {
        width: 48px;
        height: 48px;
        flex-shrink: 0;
      }

      .logo-text {
        font-size: 30px;
        font-weight: 400;
        color: white;
        letter-spacing: -0.03em;
        line-height: 1;
        margin: 0;
      }

      .logo-text-bold {
        font-weight: 700;
      }

      .logo-tm {
        font-size: 11px;
        font-weight: 400;
        opacity: 0.5;
        vertical-align: super;
        margin-left: 1px;
      }

      .logo-badge {
        display: inline-block;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        color: rgba(147, 197, 253, 0.85);
        background: rgba(59, 130, 246, 0.15);
        padding: 3px 8px;
        border-radius: 4px;
        margin-top: 5px;
      }

      /* Tagline */
      .brand-tagline {
        font-size: 17px;
        line-height: 1.65;
        color: rgba(203, 213, 225, 0.9);
        margin: 0 0 36px;
        font-weight: 400;
      }

      /* Features */
      .brand-features {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 40px;
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .feature-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: rgba(59, 130, 246, 0.14);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #93c5fd;
      }

      .feature-icon svg {
        width: 18px;
        height: 18px;
      }

      .feature-title {
        display: block;
        font-size: 15px;
        font-weight: 600;
        color: white;
        line-height: 1.25;
      }

      .feature-desc {
        display: block;
        font-size: 13px;
        color: rgba(148, 163, 184, 0.85);
        line-height: 1.4;
        margin-top: 2px;
      }

      /* Trust */
      .brand-trust {
      }

      .trust-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
        margin-bottom: 20px;
      }

      .trust-badges {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .trust-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 500;
        color: rgba(148, 163, 184, 0.7);
        letter-spacing: 0.02em;
      }

      .trust-item svg {
        width: 13px;
        height: 13px;
      }

      .trust-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: rgba(148, 163, 184, 0.3);
      }

      /* ─── Form Panel (Right 40%) ─── */
      .form-panel {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 32px;
        padding-right: max(32px, env(safe-area-inset-right, 32px));
        background: var(--bg-body);
        position: relative;
      }

      /* Subtle top-right accent */
      .form-panel::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 240px;
        height: 240px;
        background: radial-gradient(
          ellipse at top right,
          rgba(30, 64, 175, 0.04) 0%,
          transparent 70%
        );
        pointer-events: none;
      }

      .form-wrapper {
        width: 100%;
        max-width: 400px;
        position: relative;
      }

      .mobile-logo {
        display: none;
      }

      .form-content {
        background: white;
        border-radius: 14px;
        border: 1px solid var(--border-color);
        padding: 32px 32px 28px;
        box-shadow:
          0 1px 2px rgba(0, 0, 0, 0.03),
          0 4px 12px rgba(0, 0, 0, 0.03),
          0 8px 24px rgba(0, 0, 0, 0.02);
      }

      .form-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 20px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .footer-lock {
        width: 13px;
        height: 13px;
        opacity: 0.5;
      }

      /* ─── Responsive ─── */

      /* Large tablet / small desktop */
      @media (max-width: 1024px) {
        .brand-panel {
          width: 50%;
          min-width: 360px;
        }

        .brand-content {
          max-width: 420px;
          padding: 40px;
          padding-right: 56px;
          padding-bottom: max(56px, env(safe-area-inset-bottom, 56px));
          padding-left: max(40px, env(safe-area-inset-left, 40px));
        }

        .logo-text {
          font-size: 26px;
        }
        .brand-tagline {
          font-size: 15px;
          margin-bottom: 28px;
        }
        .feature-title {
          font-size: 14px;
        }
        .feature-desc {
          font-size: 12px;
        }

        .form-panel {
          padding: 32px 24px;
        }
        .form-content {
          padding: 28px 24px 24px;
        }
      }

      /* Tablet */
      @media (max-width: 768px) {
        .auth-shell {
          flex-direction: column;
          position: relative;
        }

        /* Brand panel becomes full-screen background */
        .brand-panel {
          position: fixed;
          inset: 0;
          width: 100%;
          min-width: 0;
          z-index: 0;
        }

        /* Hide textual brand content on mobile — only keep decorative background */
        .brand-content {
          display: none;
        }

        .form-panel {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 32px 20px;
          padding-top: max(32px, env(safe-area-inset-top, 32px));
          padding-bottom: max(32px, env(safe-area-inset-bottom, 32px));
          padding-left: max(20px, env(safe-area-inset-left, 20px));
          padding-right: max(20px, env(safe-area-inset-right, 20px));
          background: transparent;
        }

        .form-panel::before {
          display: none;
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 28px;
        }

        .mobile-logo svg {
          width: 38px;
          height: 38px;
        }

        .mobile-logo-text {
          font-size: 24px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.025em;
        }

        .form-content {
          padding: 28px 24px 24px;
          border-radius: 14px;
        }

        .form-footer {
          font-size: 11px;
          color: rgba(203, 213, 225, 0.75);
        }
      }

      /* Small mobile */
      @media (max-width: 380px) {
        .form-panel {
          padding: 24px 16px;
        }

        .form-content {
          padding: 24px 20px 20px;
          border-radius: 12px;
        }

        .mobile-logo {
          margin-bottom: 20px;
        }

        .mobile-logo svg {
          width: 32px;
          height: 32px;
        }

        .mobile-logo-text {
          font-size: 20px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .geo-rings {
          animation: none;
        }
      }
    `
  ]
})
export class AuthLayoutComponent {}
