import { Injectable } from '@angular/core';
import { IAuthTokens } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly _accessTokenKey = 'accessToken';
  private readonly _refreshTokenKey = 'refreshToken';
  private readonly _tokenExpiryKey = 'tokenExpiry';

  public setTokens(tokens: IAuthTokens): void {
    localStorage.setItem(this._accessTokenKey, tokens.accessToken);
    localStorage.setItem(this._refreshTokenKey, tokens.refreshToken);

    // Calculate and store expiry time
    const expiryTime = Date.now() + tokens.expiresIn * 1000;
    localStorage.setItem(this._tokenExpiryKey, expiryTime.toString());
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this._accessTokenKey);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this._refreshTokenKey);
  }

  public clearTokens(): void {
    localStorage.removeItem(this._accessTokenKey);
    localStorage.removeItem(this._refreshTokenKey);
    localStorage.removeItem(this._tokenExpiryKey);
  }

  public isTokenValid(): boolean {
    const token = this.getAccessToken();
    const expiryTime = localStorage.getItem(this._tokenExpiryKey);

    if (!token || !expiryTime) {
      return false;
    }

    // Check if token has expired
    const now = Date.now();
    const expiry = parseInt(expiryTime, 10);

    // Token is valid if the current time is before expiry with a 10-second buffer
    return now < expiry - 10000;
  }

  /**
   * Decodes and returns the JWT token payload.
   * @template T - The expected type of the token payload
   * @returns The decoded token payload or null if token is invalid/missing
   */
  public getTokenPayload<T = Record<string, unknown>>(): T | null {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    // Basic JWT format validation (should have 3 parts separated by dots)
    if (!this._isValidJwtFormat(token)) {
      return null;
    }

    try {
      const payload = jwtDecode<T>(token);

      // Additional validation: check if payload is an object
      if (typeof payload !== 'object' || payload === null) {
        return null;
      }

      return payload;
    } catch (error) {
      // Log error in development mode for debugging
      if (typeof window !== 'undefined' && window.console && !this._isProduction()) {
        console.warn('Failed to decode JWT token:', error);
      }
      return null;
    }
  }

  /**
   * Validates basic JWT format (3 parts separated by dots)
   * @param token - The token to validate
   * @returns True if token has valid JWT format
   */
  private _isValidJwtFormat(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Checks if the application is running in production mode
   * @returns True if in production mode
   */
  private _isProduction(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.location?.hostname !== 'localhost' &&
      !window.location?.hostname?.includes('127.0.0.1')
    );
  }
}
