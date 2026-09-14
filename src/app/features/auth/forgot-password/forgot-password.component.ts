import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
          <h2 class="auth-title">Reset Password</h2>
          <p class="auth-subtitle">Enter your account email to receive reset instructions</p>
        </div>

        @if (successMessage) {
          <div class="alert alert-success">
            {{ successMessage }}
          </div>
          <div class="text-center mt-4">
            <a routerLink="/login" class="btn btn-primary btn-sm">Return to Sign In</a>
          </div>
        } @else {
          @if (errorMessage) {
            <div class="alert alert-danger mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" #forgotForm="ngForm">
            <div class="form-group">
              <label class="form-label" for="email">Account Email</label>
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

            <button
              type="submit"
              [disabled]="forgotForm.invalid || isSubmitting"
              class="btn btn-primary w-full mt-2"
            >
              @if (isSubmitting) {
                <span>Sending Recovery Email...</span>
              } @else {
                <span>Send Reset Link</span>
              }
            </button>
          </form>
        }

        <div class="auth-footer mt-5 text-center text-sm text-muted">
          Remember password? <a routerLink="/login" class="font-semibold text-heading">Sign In</a>
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
    .w-full { width: 100%; }
  `]
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  email = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  onSubmit(): void {
    if (!this.email) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'Password reset email sent if account exists.';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'Failed to request password reset.';
      }
    });
  }
}
