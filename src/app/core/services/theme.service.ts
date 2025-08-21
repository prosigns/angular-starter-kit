import { Injectable, RendererFactory2, inject, signal, DOCUMENT } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal to track current theme
  public readonly currentTheme = signal<Theme>('system');

  private _document = inject(DOCUMENT);
  private _renderer = inject(RendererFactory2).createRenderer(null, null);
  private _window = window;

  private readonly _themeKey = 'app-theme';

  public initializeTheme(): void {
    // Get saved theme or default to system
    const savedTheme = (localStorage.getItem(this._themeKey) as Theme) || 'system';
    this.setTheme(savedTheme);

    // Listen for system preference changes
    this._listenForSystemPreferenceChanges();
  }

  public setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this._themeKey, theme);

    if (theme === 'system') {
      this._applySystemTheme();
    } else {
      this._applyTheme(theme);
    }
  }

  public toggleTheme(): void {
    const theme = this.currentTheme();
    if (theme === 'light') {
      this.setTheme('dark');
    } else if (theme === 'dark') {
      this.setTheme('light');
    } else {
      // If system is active, toggle to explicit light/dark based on current system preference
      const systemTheme = this._getSystemTheme();
      this.setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    }
  }

  public getCurrentThemeClass(): string {
    if (this.currentTheme() !== 'system') {
      return this.currentTheme();
    }
    return this._getSystemTheme();
  }

  private _applyTheme(theme: 'light' | 'dark'): void {
    // Remove current theme classes
    this._renderer.removeClass(this._document.documentElement, 'light');
    this._renderer.removeClass(this._document.documentElement, 'dark');

    // Add new theme class
    this._renderer.addClass(this._document.documentElement, theme);

    // Update color scheme meta tag
    this._updateColorSchemeMeta(theme);
  }

  private _applySystemTheme(): void {
    const systemTheme = this._getSystemTheme();
    this._applyTheme(systemTheme);
  }

  private _getSystemTheme(): 'light' | 'dark' {
    if (this._window?.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private _listenForSystemPreferenceChanges(): void {
    this._window?.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.currentTheme() === 'system') {
        this._applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  private _updateColorSchemeMeta(theme: 'light' | 'dark'): void {
    // Find the meta tag or create it if it doesn't exist
    let metaTag = this._document.querySelector('meta[name="color-scheme"]');

    if (!metaTag) {
      metaTag = this._document.createElement('meta');
      this._renderer.setAttribute(metaTag, 'name', 'color-scheme');
      this._renderer.appendChild(this._document.head, metaTag);
    }

    // Update value
    this._renderer.setAttribute(metaTag, 'content', theme);
  }
}
