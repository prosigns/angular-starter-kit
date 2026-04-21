import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private _sanitizer = inject(DomSanitizer);

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  public sanitizeHtml(html: string): SafeHtml {
    return this._sanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitize URL to prevent malicious redirects
   */
  public sanitizeUrl(url: string): SafeUrl {
    return this._sanitizer.sanitize(4, url) || '';
  }

  /**
   * Sanitize resource URL for iframes, etc.
   */
  public sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this._sanitizer.sanitize(5, url) || '';
  }

  /**
   * Clean user input by removing potentially dangerous characters
   */
  public cleanInput(input: string): string {
    if (!input) return '';

    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate email format
   */
  public isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  public isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  }

  /**
   * Check for SQL injection patterns
   */
  public containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /('|(--)|;|(\||\|)|(\*|\*))/i,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Generate Content Security Policy header value
   */
  public generateCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://ct-server.prosigns.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  /**
   * Validate file upload security
   */
  public validateFileUpload(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds limit' };
    }

    return { isValid: true };
  }

  /**
   * Generate CSRF token
   */
  public generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Rate limiting check (simple implementation)
   */
  public checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');

    const validRequests = requests.filter((timestamp: number) => now - timestamp < windowMs);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validRequests));

    return true;
  }
}
