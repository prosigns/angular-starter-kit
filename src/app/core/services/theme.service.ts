
import { Injectable, Renderer2, RendererFactory2, inject, signal, DOCUMENT } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private renderer: Renderer2;
  private window = window;
  
  private readonly THEME_KEY = 'app-theme';
  
  // Signal to track current theme
  readonly currentTheme = signal<Theme>('system');
  
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }
  
  initializeTheme(): void {
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme || 'system';
    this.setTheme(savedTheme);
    
    // Listen for system preference changes
    this.listenForSystemPreferenceChanges();
  }
  
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    
    if (theme === 'system') {
      this.applySystemTheme();
    } else {
      this.applyTheme(theme);
    }
  }
  
  toggleTheme(): void {
    const theme = this.currentTheme();
    if (theme === 'light') {
      this.setTheme('dark');
    } else if (theme === 'dark') {
      this.setTheme('light');
    } else {
      // If system is active, toggle to explicit light/dark based on current system preference
      const systemTheme = this.getSystemTheme();
      this.setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    }
  }
  
  getCurrentThemeClass(): string {
    if (this.currentTheme() !== 'system') {
      return this.currentTheme();
    }
    return this.getSystemTheme();
  }
  
  private applyTheme(theme: 'light' | 'dark'): void {
    // Remove current theme classes
    this.renderer.removeClass(this.document.documentElement, 'light');
    this.renderer.removeClass(this.document.documentElement, 'dark');
    
    // Add new theme class
    this.renderer.addClass(this.document.documentElement, theme);
    
    // Update color scheme meta tag
    this.updateColorSchemeMeta(theme);
  }
  
  private applySystemTheme(): void {
    const systemTheme = this.getSystemTheme();
    this.applyTheme(systemTheme);
  }
  
  private getSystemTheme(): 'light' | 'dark' {
    if (this.window?.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  private listenForSystemPreferenceChanges(): void {
    this.window?.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (this.currentTheme() === 'system') {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }
  
  private updateColorSchemeMeta(theme: 'light' | 'dark'): void {
    // Find the meta tag or create it if it doesn't exist
    let metaTag = this.document.querySelector('meta[name="color-scheme"]');
    
    if (!metaTag) {
      metaTag = this.document.createElement('meta');
      this.renderer.setAttribute(metaTag, 'name', 'color-scheme');
      this.renderer.appendChild(this.document.head, metaTag);
    }
    
    // Update value
    this.renderer.setAttribute(metaTag, 'content', theme);
  }
} 