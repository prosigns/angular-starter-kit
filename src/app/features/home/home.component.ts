import { Component, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [RouterModule, TranslateModule],
  template: `
    <div class="home-container">
      <header class="home-header">
        <div class="container">
          <h1 class="home-title">{{ 'home.title' | translate }}</h1>
          <p class="home-subtitle">{{ 'home.subtitle' | translate }}</p>

          <div class="home-actions">
            <button class="btn btn-primary" routerLink="/auth/login">
              {{ 'home.loginButton' | translate }}
            </button>
            <button class="btn btn-secondary" routerLink="/auth/register">
              {{ 'home.registerButton' | translate }}
            </button>
          </div>
        </div>
      </header>

      <main class="home-main container">
        <section class="home-features">
          <h2>{{ 'home.features.title' | translate }}</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <h3>{{ 'home.features.performance.title' | translate }}</h3>
              <p>{{ 'home.features.performance.description' | translate }}</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <h3>{{ 'home.features.security.title' | translate }}</h3>
              <p>{{ 'home.features.security.description' | translate }}</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💻</div>
              <h3>{{ 'home.features.responsive.title' | translate }}</h3>
              <p>{{ 'home.features.responsive.description' | translate }}</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🌐</div>
              <h3>{{ 'home.features.i18n.title' | translate }}</h3>
              <p>{{ 'home.features.i18n.description' | translate }}</p>
            </div>
          </div>
        </section>
      </main>

      <footer class="home-footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-branding">
              <h3>{{ 'app.name' | translate }}</h3>
              <p>{{ 'footer.copyright' | translate }}</p>
            </div>

            <div class="footer-links">
              <div class="footer-section">
                <h4>{{ 'footer.links.title' | translate }}</h4>
                <ul>
                  <li>
                    <a href="#">{{ 'footer.links.about' | translate }}</a>
                  </li>
                  <li>
                    <a href="#">{{ 'footer.links.contact' | translate }}</a>
                  </li>
                  <li>
                    <a href="#">{{ 'footer.links.privacy' | translate }}</a>
                  </li>
                  <li>
                    <a href="#">{{ 'footer.links.terms' | translate }}</a>
                  </li>
                </ul>
              </div>

              <div class="footer-section">
                <h4>{{ 'footer.language' | translate }}</h4>
                <div class="language-selector">
                  <button (click)="changeLanguage('en')">English</button>
                  <button (click)="changeLanguage('es')">Español</button>
                  <button (click)="changeLanguage('fr')">Français</button>
                </div>
              </div>

              <div class="footer-section">
                <h4>{{ 'footer.theme' | translate }}</h4>
                <button (click)="toggleTheme()" class="theme-toggle">
                  @if (themeService.currentTheme() === 'light') {
                    <span>🌙 {{ 'footer.darkMode' | translate }}</span>
                  }
                  @if (themeService.currentTheme() === 'dark') {
                    <span>☀️ {{ 'footer.lightMode' | translate }}</span>
                  }
                  @if (themeService.currentTheme() === 'system') {
                    <span>🖥️ {{ 'footer.systemTheme' | translate }}</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .home-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .home-header {
        padding: 5rem 0;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
        text-align: center;
      }

      .home-title {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      .home-subtitle {
        font-size: 1.25rem;
        max-width: 600px;
        margin: 0 auto 2rem;
        opacity: 0.9;
      }

      .home-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .btn-primary {
        background-color: white;
        color: #4f46e5;
      }

      .btn-primary:hover {
        background-color: #f9fafb;
        transform: translateY(-2px);
      }

      .btn-secondary {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .btn-secondary:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .home-main {
        flex: 1;
        padding: 4rem 0;
      }

      .home-features h2 {
        text-align: center;
        margin-bottom: 3rem;
        font-size: 2rem;
        font-weight: 700;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
      }

      .feature-item {
        padding: 2rem;
        border-radius: 0.5rem;
        background-color: #f9fafb;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: transform 0.2s;
      }

      .feature-item:hover {
        transform: translateY(-5px);
      }

      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      .feature-item h3 {
        margin-bottom: 0.5rem;
        font-weight: 600;
      }

      .home-footer {
        background-color: #1f2937;
        color: white;
        padding: 3rem 0;
      }

      .footer-content {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
      }

      .footer-branding {
        flex: 1 1 300px;
      }

      .footer-links {
        flex: 2 1 600px;
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
      }

      .footer-section {
        flex: 1 1 180px;
      }

      .footer-section h4 {
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .footer-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .footer-section li {
        margin-bottom: 0.5rem;
      }

      .footer-section a {
        color: #d1d5db;
        text-decoration: none;
        transition: color 0.2s;
      }

      .footer-section a:hover {
        color: white;
      }

      .language-selector {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .language-selector button,
      .theme-toggle {
        background: transparent;
        border: 1px solid #4b5563;
        color: #d1d5db;
        padding: 0.375rem 0.75rem;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .language-selector button:hover,
      .theme-toggle:hover {
        background-color: #374151;
        color: white;
      }

      /* Dark mode styles */
      :host-context(.dark) .feature-item {
        background-color: #1f2937;
        color: #e5e7eb;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.2),
          0 2px 4px -1px rgba(0, 0, 0, 0.1);
      }

      :host-context(.dark) .home-footer {
        background-color: #111827;
      }

      /* Responsive styles */
      @media (max-width: 768px) {
        .home-title {
          font-size: 2.25rem;
        }

        .home-subtitle {
          font-size: 1rem;
        }

        .footer-content {
          flex-direction: column;
        }

        .home-header {
          padding: 3rem 0;
        }

        .home-main {
          padding: 2rem 0;
        }
      }
    `
  ]
})
export class HomeComponent implements OnInit {
  private translateService = inject(TranslateService);
  public themeService = inject(ThemeService);

  ngOnInit(): void {
    // Load translations for homepage
  }

  changeLanguage(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
