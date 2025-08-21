import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import {
  IAuthTokens,
  ILoginCredentials,
  IRegisterCredentials,
  IUserProfile
} from '../models/auth.model';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signals for reactive approach
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly userProfile = signal<IUserProfile | null>(null);

  // Observables for backward compatibility - must be declared before private fields
  public readonly userProfile$: Observable<IUserProfile | null>;
  public readonly isAuthenticated$: Observable<boolean>;
  public readonly userRoles$: Observable<string[]>;

  // Private dependencies and configuration
  private _http = inject(HttpClient);
  private _tokenService = inject(TokenService);
  private _router = inject(Router);
  private readonly _apiUrl = `${environment.apiUrl}/auth`;

  // User authentication state observables
  private _userProfileSubject = new BehaviorSubject<IUserProfile | null>(null);
  private _isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private _userRolesSubject = new BehaviorSubject<string[]>([]);

  constructor() {
    // Initialize observables after subjects are created
    this.userProfile$ = this._userProfileSubject.asObservable();
    this.isAuthenticated$ = this._isAuthenticatedSubject.asObservable();
    this.userRoles$ = this._userRolesSubject.asObservable();
  }

  // Initialize authentication state from stored token
  public initAuth(): Promise<boolean> {
    // Check for a valid token
    if (this._tokenService.isTokenValid()) {
      // Attempt to load user profile with the stored token
      return this.getCurrentUser()
        .toPromise()
        .then(() => true)
        .catch(() => {
          // If loading user fails, clear authentication
          this._clearAuthState();
          return false;
        });
    } else {
      // No valid token, clear any stale auth data
      this._clearAuthState();
      return Promise.resolve(false);
    }
  }

  public login(credentials: ILoginCredentials): Observable<IUserProfile> {
    return this._http
      .post<{ tokens: IAuthTokens; user: IUserProfile }>(`${this._apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this._tokenService.setTokens(response.tokens);
          this._updateAuthState(response.user);
        }),
        map(response => response.user)
      );
  }

  public register(userData: IRegisterCredentials): Observable<IUserProfile> {
    return this._http
      .post<{ tokens: IAuthTokens; user: IUserProfile }>(`${this._apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          this._tokenService.setTokens(response.tokens);
          this._updateAuthState(response.user);
        }),
        map(response => response.user)
      );
  }

  public logout(): void {
    // Call logout API to invalidate refresh token
    this._http
      .post(`${this._apiUrl}/logout`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this._clearAuthState();
        this._router.navigate(['/auth/login']);
      });
  }

  public refreshToken(): Observable<IAuthTokens> {
    const refreshToken = this._tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this._http
      .post<{ tokens: IAuthTokens }>(`${this._apiUrl}/refresh`, { refreshToken })
      .pipe(map(response => response.tokens));
  }

  public getCurrentUser(): Observable<IUserProfile> {
    return this._http.get<{ user: IUserProfile }>(`${this._apiUrl}/me`).pipe(
      map(response => response.user),
      tap(user => this._updateAuthState(user))
    );
  }

  public requestPasswordReset(email: string): Observable<void> {
    return this._http.post<void>(`${this._apiUrl}/forgot-password`, { email });
  }

  public resetPassword(token: string, newPassword: string): Observable<void> {
    return this._http.post<void>(`${this._apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  private _updateAuthState(user: IUserProfile): void {
    this._userProfileSubject.next(user);
    this._isAuthenticatedSubject.next(true);
    this._userRolesSubject.next(user.roles || []);

    // Update signals
    this.isAuthenticated.set(true);
    this.userProfile.set(user);
  }

  private _clearAuthState(): void {
    this._tokenService.clearTokens();
    this._userProfileSubject.next(null);
    this._isAuthenticatedSubject.next(false);
    this._userRolesSubject.next([]);

    // Update signals
    this.isAuthenticated.set(false);
    this.userProfile.set(null);
  }
}
