import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
          <h2 class="auth-title">Email Verification</h2>
          <p class="auth-subtitle">Securing access to your hardware operations portal</p>
        </div>

        @if (isLoading) {
          <div class="text-center py-6">
            <p class="text-sm text-muted">Validating cryptographic security token...</p>
          </div>
        } @else if (successMessage) {
          <div class="alert alert-success">
            {{ successMessage }}
          </div>
          <div class="text-center mt-4">
            <a routerLink="/login" class="btn btn-primary">Sign In to Your Console</a>
          </div>
        } @else {
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
          <div class="text-center mt-4">
            <a routerLink="/login" class="btn btn-secondary">Return to Sign In</a>
          </div>
        }
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
  `]
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  isLoading = true;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParams['userId'];
    const token = this.route.snapshot.queryParams['token'];

    if (!userId || !token) {
      this.isLoading = false;
      this.errorMessage = 'Invalid verification link. Missing security parameters.';
      return;
    }

    this.authService.verifyEmail({ userId, token }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Email verified successfully! You can now log in.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Verification link expired or invalid.';
      }
    });
  }
}
