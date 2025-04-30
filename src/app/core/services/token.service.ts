import { Injectable } from '@angular/core';
import { AuthTokens } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    
    // Calculate and store expiry time
    const expiryTime = Date.now() + tokens.expiresIn * 1000;
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  isTokenValid(): boolean {
    const token = this.getAccessToken();
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!token || !expiryTime) {
      return false;
    }
    
    // Check if token has expired
    const now = Date.now();
    const expiry = parseInt(expiryTime, 10);
    
    // Token is valid if the current time is before expiry with a 10-second buffer
    return now < expiry - 10000;
  }

  getTokenPayload<T>(): T | null {
    const token = this.getAccessToken();
    
    if (!token) {
      return null;
    }
    
    try {
      return jwtDecode<T>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
} 