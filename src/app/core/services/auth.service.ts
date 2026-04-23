import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { SessionStorageService } from './session-storage.service';
import { ToastService } from './toast.service';
import { ApiModuleEnum } from '../enums/api-modules.enum';

export interface ILoginRequest {
  email: string;
  password: string;
  deviceId: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  buildNumber: string;
  deviceType: string;
  platform: string;
  userAgent: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
}

export interface IUserRole {
  id: string;
  description: string;
  displayName: string;
}

export interface ILoginResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
  user: {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    imageUrl: string | null;
    isActive: boolean;
    emailConfirmed: boolean;
    roles: IUserRole[];
  };
}

export interface IUser {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  imageUrl: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  roles?: IUserRole[];
  permissions?: string[];
}

export interface IAuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authState$: Observable<IAuthState>;

  private _httpService = inject(HttpService);
  private _sessionStorageService = inject(SessionStorageService);
  private _toastService = inject(ToastService);
  private _router = inject(Router);

  private readonly _tokenKey = 'token';
  private readonly _refreshTokenKey = 'refresh_token';
  private readonly _refreshTokenExpiryKey = 'refresh_token_expiry';
  private readonly _userKey = 'user';

  private _authStateSubject = new BehaviorSubject<IAuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  constructor() {
    this.authState$ = this._authStateSubject.asObservable();
    this._initializeAuthState();
  }

  public login(credentials: ILoginRequest): Observable<ILoginResponse> {
    return this._httpService
      .post<ILoginResponse>(ApiModuleEnum.AUTH, '/tokens/login', credentials)
      .pipe(
        tap(response => {
          this._handleLoginSuccess(response);
        }),
        catchError(error => {
          this._handleLoginError(error);
          return throwError(() => error);
        })
      );
  }

  public logout(): void {
    this._clearStoredData();
    this._updateAuthState(false, null, null);
    this._toastService.showInfo('You have been logged out successfully.');
    this._router.navigate(['/auth/login']);
  }

  public refreshToken(): Observable<ILoginResponse> {
    const refreshToken = this._getStoredRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this._httpService
      .post<ILoginResponse>(ApiModuleEnum.AUTH, '/tokens/refresh', {
        refreshToken
      })
      .pipe(
        tap(response => {
          this._handleLoginSuccess(response);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  public isAuthenticated(): boolean {
    const token = this._getStoredToken();
    const user = this._getStoredUser();
    return !!(token && user);
  }

  public getCurrentUser(): IUser | null {
    return this._authStateSubject.value.user;
  }

  public getToken(): string | null {
    return this._authStateSubject.value.token;
  }

  public hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  public hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.some(role => role.displayName === roleName) || false;
  }

  public getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles?.map(role => role.displayName) || [];
  }

  public getUserRoleDetails(): IUserRole[] {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }

  public getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  public isTokenExpired(): boolean {
    const token = this._getStoredToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  public autoRefreshToken(): Observable<boolean> {
    if (this.isTokenExpired() && this._getStoredRefreshToken()) {
      return this.refreshToken().pipe(
        map(() => true),
        catchError(() => {
          this.logout();
          return throwError(() => false);
        })
      );
    }
    return new BehaviorSubject(true).asObservable();
  }

  public requestPasswordReset(email: string): Observable<void> {
    return this._httpService.post<void>(ApiModuleEnum.USERS, '/forgot-password', { email });
  }

  private _initializeAuthState(): void {
    const token = this._getStoredToken();
    const user = this._getStoredUser();

    if (token && user) {
      this._updateAuthState(true, user, token);
    }
  }

  private _handleLoginSuccess(response: ILoginResponse): void {
    this._sessionStorageService.setItem(this._tokenKey, response.token);
    this._sessionStorageService.setItem(this._refreshTokenKey, response.refreshToken);
    this._sessionStorageService.setItem(
      this._refreshTokenExpiryKey,
      response.refreshTokenExpiryTime
    );
    this._sessionStorageService.setItem(this._userKey, response.user);
    this._updateAuthState(true, response.user, response.token);
    this._toastService.showSuccess(`Welcome back, ${response.user.firstName}!`);
  }

  private _handleLoginError(error: unknown): void {
    let errorMessage = 'Login failed. Please try again.';

    if (this._isHttpError(error)) {
      if (error.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.status === 403) {
        errorMessage = 'Account is locked or suspended.';
      } else if (error.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    this._toastService.showError(errorMessage);
  }

  private _isHttpError(error: unknown): error is { status: number; error?: { message?: string } } {
    return typeof error === 'object' && error !== null && 'status' in error;
  }

  private _updateAuthState(
    isAuthenticated: boolean,
    user: IUser | null,
    token: string | null
  ): void {
    this._authStateSubject.next({
      isAuthenticated,
      user,
      token
    });
  }

  private _getStoredToken(): string | null {
    return this._sessionStorageService.getItem<string>(this._tokenKey);
  }

  private _getStoredRefreshToken(): string | null {
    return this._sessionStorageService.getItem<string>(this._refreshTokenKey);
  }

  private _getStoredUser(): IUser | null {
    return this._sessionStorageService.getItem<IUser>(this._userKey);
  }

  private _clearStoredData(): void {
    this._sessionStorageService.removeItem(this._tokenKey);
    this._sessionStorageService.removeItem(this._refreshTokenKey);
    this._sessionStorageService.removeItem(this._refreshTokenExpiryKey);
    this._sessionStorageService.removeItem(this._userKey);
  }
}
