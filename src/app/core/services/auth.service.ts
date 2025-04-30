import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthTokens, LoginCredentials, RegisterCredentials, UserProfile } from '../models/auth.model';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // User authentication state observables
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRolesSubject = new BehaviorSubject<string[]>([]);
  
  // Signals for reactive approach
  readonly isAuthenticated = signal<boolean>(false);
  readonly userProfile = signal<UserProfile | null>(null);
  
  // Observables for backward compatibility
  readonly userProfile$ = this.userProfileSubject.asObservable();
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  readonly userRoles$ = this.userRolesSubject.asObservable();
  
  // Initialize authentication state from stored token
  initAuth(): Promise<boolean> {
    // Check for a valid token
    if (this.tokenService.isTokenValid()) {
      // Attempt to load user profile with the stored token
      return this.getCurrentUser().toPromise()
        .then(() => true)
        .catch(() => {
          // If loading user fails, clear authentication
          this.clearAuthState();
          return false;
        });
    } else {
      // No valid token, clear any stale auth data
      this.clearAuthState();
      return Promise.resolve(false);
    }
  }
  
  login(credentials: LoginCredentials): Observable<UserProfile> {
    return this.http.post<{ tokens: AuthTokens, user: UserProfile }>(
      `${this.apiUrl}/login`, 
      credentials
    ).pipe(
      tap(response => {
        this.tokenService.setTokens(response.tokens);
        this.updateAuthState(response.user);
      }),
      map(response => response.user)
    );
  }
  
  register(userData: RegisterCredentials): Observable<UserProfile> {
    return this.http.post<{ tokens: AuthTokens, user: UserProfile }>(
      `${this.apiUrl}/register`, 
      userData
    ).pipe(
      tap(response => {
        this.tokenService.setTokens(response.tokens);
        this.updateAuthState(response.user);
      }),
      map(response => response.user)
    );
  }
  
  logout(): void {
    // Call logout API to invalidate refresh token
    this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      });
  }
  
  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<{ tokens: AuthTokens }>(
      `${this.apiUrl}/refresh`,
      { refreshToken }
    ).pipe(
      map(response => response.tokens)
    );
  }
  
  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<{ user: UserProfile }>(`${this.apiUrl}/me`).pipe(
      map(response => response.user),
      tap(user => this.updateAuthState(user))
    );
  }
  
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email });
  }
  
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }
  
  private updateAuthState(user: UserProfile): void {
    this.userProfileSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.userRolesSubject.next(user.roles || []);
    
    // Update signals
    this.isAuthenticated.set(true);
    this.userProfile.set(user);
  }
  
  private clearAuthState(): void {
    this.tokenService.clearTokens();
    this.userProfileSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.userRolesSubject.next([]);
    
    // Update signals
    this.isAuthenticated.set(false);
    this.userProfile.set(null);
  }
} 