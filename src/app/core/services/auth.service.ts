import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';
import {
  ApiMessageResponse,
  CurrentUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  VerifyEmailRequest
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Reactive State via Signals
  readonly currentUser = signal<CurrentUser | null>(null);
  readonly isLoading = signal<boolean>(true);

  // Computed state
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly roles = computed(() => this.currentUser()?.roles ?? []);
  readonly isSuperAdmin = computed(() => this.roles().includes('SuperAdmin'));
  readonly isAdmin = computed(() => this.roles().includes('Admin') || this.isSuperAdmin());
  readonly isSupport = computed(() => this.roles().includes('Support') || this.isAdmin());
  readonly isCustomer = computed(() => this.roles().includes('Customer'));

  constructor() {
    this.restoreSession();
  }

  /**
   * Restores user session on page reload using HttpOnly cookie
   */
  restoreSession(): Observable<CurrentUser | null> {
    this.isLoading.set(true);
    return this.http.get<CurrentUser>('/api/v1/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Logs in with email and password
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/login', request).pipe(
      tap((res) => {
        // Update user state after successful login cookie assignment
        this.currentUser.set({
          id: res.id,
          email: res.email,
          displayName: res.displayName,
          roles: res.roles,
          createdAt: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Registers a new customer account
   */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/v1/auth/register', request);
  }

  /**
   * Verifies email address via token
   */
  verifyEmail(request: VerifyEmailRequest): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>('/api/v1/auth/verify-email', request);
  }

  /**
   * Requests a password reset link
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>('/api/v1/auth/forgot-password', request);
  }

  /**
   * Resets password using token
   */
  resetPassword(request: ResetPasswordRequest): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>('/api/v1/auth/reset-password', request);
  }

  /**
   * Logs out user and clears cookie
   */
  logout(): Observable<void> {
    return this.http.post<void>('/api/v1/auth/logout', {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
        return of(void 0);
      })
    );
  }
}
