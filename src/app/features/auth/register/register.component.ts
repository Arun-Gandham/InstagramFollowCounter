import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Register your physical counter and stream follower metrics</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-danger mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        @if (successMessage) {
          <div class="alert alert-success">
            <div class="font-semibold">{{ successMessage }}</div>
            <div class="mt-3">
              <a routerLink="/login" class="btn btn-primary btn-sm">Proceed to Sign In</a>
            </div>
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div class="form-group">
              <label class="form-label" for="displayName">Organization or Creator Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                [(ngModel)]="displayName"
                required
                minlength="2"
                class="form-control"
                placeholder="e.g. Acme Coffee Roasters"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="email">Work Email</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                email
                class="form-control"
                placeholder="operator@acme.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password (Minimum 8 chars, 1 uppercase, 1 digit)</label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                minlength="8"
                class="form-control"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid || isSubmitting"
              class="btn btn-primary w-full mt-2"
            >
              @if (isSubmitting) {
                <span>Registering Account...</span>
              } @else {
                <span>Create Enterprise Account</span>
              }
            </button>
          </form>
        }

        <div class="auth-footer mt-5 text-center text-sm text-muted">
          Already have an account? <a routerLink="/login" class="font-semibold text-heading">Sign In</a>
        </div>
      </div>
    </div>
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
      max-width: 440px;
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
    .w-full { width: 100%; }
  `]
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  onSubmit(): void {
    if (!this.displayName || !this.email || !this.password) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register({
      displayName: this.displayName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = `Account for ${res.displayName} created successfully! Please sign in.`;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Registration failed. Please check your information.';
      }
    });
  }
}
