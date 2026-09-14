import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { ApiConfigModalComponent } from '../../../shared/components/api-config-modal/api-config-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ApiConfigModalComponent],
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="brand-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="2"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
            </svg>
          </div>
          <h2 class="auth-title">Sign In to Console</h2>
          <p class="auth-subtitle">Manage physical counter hardware & real-time metrics</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-danger flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="email">Work Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              class="form-control"
              placeholder="operator@counter.local"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <div class="flex items-center justify-between mb-1">
              <label class="form-label" for="password">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              class="form-control"
              placeholder="••••••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isSubmitting"
            class="btn btn-primary w-full mt-2"
          >
            @if (isSubmitting) {
              <span>Authenticating...</span>
            } @else {
              <span>Sign In with Session</span>
            }
          </button>
        </form>

        <!-- Fast Role Switcher for Developers / QA -->
        <div class="preset-box mt-6">
          <div class="preset-title">ONE-CLICK TEST PERSONAS</div>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              (click)="fillPreset('customer')"
              class="btn btn-secondary btn-xs flex items-center gap-1.5"
            >
              <span>👤</span>
              <span>Customer</span>
            </button>
            <button
              type="button"
              (click)="fillPreset('superadmin')"
              class="btn btn-secondary btn-xs flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>SuperAdmin</span>
            </button>
            <button
              type="button"
              (click)="fillPreset('admin')"
              class="btn btn-secondary btn-xs flex items-center gap-1.5"
            >
              <span>🛠️</span>
              <span>Admin</span>
            </button>
            <button
              type="button"
              (click)="fillPreset('support')"
              class="btn btn-secondary btn-xs flex items-center gap-1.5"
            >
              <span>🩺</span>
              <span>Support</span>
            </button>
          </div>
        </div>

        <div class="auth-footer mt-5 text-center text-sm text-muted">
          Need a customer account? <a routerLink="/register" class="register-link font-semibold text-heading">Create Account</a>
        </div>

        <!-- API Server Hint -->
        <div class="text-center mt-3">
          <button type="button" (click)="openApiModal()" class="api-hint-btn">
            Gateway: <span class="font-mono text-heading">{{ configService.apiUrl() || 'Proxy (Relative)' }}</span> ⚙️
          </button>
        </div>
      </div>
    </div>

    <!-- API Config Modal -->
    @if (isApiModalOpen) {
      <app-api-config-modal
        [isOpen]="isApiModalOpen"
        (closeRequested)="closeApiModal()"
      ></app-api-config-modal>
    }
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 65px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      background-color: var(--bg-canvas);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 2.25rem 2rem;
      box-shadow: var(--shadow-lg);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .brand-badge {
      width: 44px;
      height: 44px;
      background: var(--gradient-ig);
      border-radius: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.85rem;
      box-shadow: 0 4px 12px rgba(221, 42, 123, 0.25);
    }
    .brand-badge svg {
      width: 22px;
      height: 22px;
    }
    .auth-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .auth-subtitle {
      color: #64748b;
      font-size: 0.8125rem;
      margin-top: 0.25rem;
    }
    .forgot-link {
      font-size: 0.75rem;
      color: #64748b;
      text-decoration: none;
    }
    .forgot-link:hover {
      color: #0f172a;
      text-decoration: underline;
    }
    .register-link {
      color: #0f172a;
      text-decoration: none;
    }
    .register-link:hover {
      text-decoration: underline;
    }
    .w-full { width: 100%; }
    .preset-box {
      background: #f8fafc;
      padding: 0.85rem;
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-sm);
    }
    .preset-title {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      text-align: center;
    }
    .api-hint-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .api-hint-btn:hover {
      color: #0f172a;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  readonly configService = inject(ConfigService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;
  isApiModalOpen = false;

  openApiModal(): void {
    this.isApiModalOpen = true;
  }

  closeApiModal(): void {
    this.isApiModalOpen = false;
  }

  fillPreset(persona: 'customer' | 'superadmin' | 'admin' | 'support'): void {
    switch (persona) {
      case 'customer':
        this.email = 'customer@counter.local';
        this.password = 'CustomerPass123!';
        break;
      case 'superadmin':
        this.email = 'arunsaigandham1998@gmail.com';
        this.password = 'G_arunsai@1998';
        break;
      case 'admin':
        this.email = 'admin@counter.local';
        this.password = 'AdminPass123!';
        break;
      case 'support':
        this.email = 'support@counter.local';
        this.password = 'SupportPass123!';
        break;
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
