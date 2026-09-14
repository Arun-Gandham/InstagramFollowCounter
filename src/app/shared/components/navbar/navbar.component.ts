import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { ApiConfigModalComponent } from '../api-config-modal/api-config-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ApiConfigModalComponent],
  template: `
    <header class="navbar-header">
      <div class="container flex items-center justify-between">
        <!-- Brand Identity -->
        <a routerLink="/" class="brand-logo flex items-center gap-3">
          <div class="logo-box">
            <svg class="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="2"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="brand-title">FOLLOWER<span class="brand-gradient-text">COUNTER</span></span>
              <span class="hardware-tag">ENTERPRISE</span>
            </div>
            <span class="brand-subtitle">ELECTRO-MECHANICAL DISPLAY CONSOLE</span>
          </div>
        </a>

        <!-- Segmented Navigation Pills -->
        <nav class="nav-segmented flex items-center gap-1">
          @if (authService.isAuthenticated()) {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-tab">
              <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span>Dashboard</span>
            </a>

            @if (authService.isAdmin()) {
              <a routerLink="/admin/provisioning" routerLinkActive="active" class="nav-tab">
                <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                </svg>
                <span>Factory</span>
              </a>
              <a routerLink="/admin/users" routerLinkActive="active" class="nav-tab">
                <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <span>Users</span>
              </a>
              <a routerLink="/admin/overview" routerLinkActive="active" class="nav-tab">
                <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Fleet</span>
              </a>
            }
          }
        </nav>

        <!-- Right Side: API Indicator & Profile -->
        <div class="user-actions flex items-center gap-3">
          <!-- Live API Indicator -->
          <button
            type="button"
            (click)="openApiModal()"
            class="api-endpoint-pill flex items-center gap-2"
            title="Configure Backend API endpoint URL"
          >
            <span class="api-radar-pulse">
              <span class="radar-ping"></span>
              <span class="radar-dot"></span>
            </span>
            <span class="api-label font-mono">{{ getShortApiUrl() }}</span>
            <svg class="gear-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
          </button>

          @if (authService.isAuthenticated()) {
            <!-- User Profile Pill -->
            <div class="user-profile-chip flex items-center gap-2">
              <div class="user-avatar-ring">
                <span class="user-initial">{{ authService.currentUser()?.displayName?.charAt(0) || 'U' }}</span>
              </div>
              <div class="user-meta">
                <span class="user-name">{{ authService.currentUser()?.displayName }}</span>
                <span class="user-role-badge" [ngClass]="getRoleBadgeClass()">
                  {{ authService.roles()[0] || 'User' }}
                </span>
              </div>
            </div>

            <!-- Sign Out Button -->
            <button
              type="button"
              (click)="onLogout()"
              class="btn-icon-logout"
              title="Sign Out"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
              </svg>
            </button>
          } @else {
            <a routerLink="/login" class="btn btn-secondary btn-sm">Sign In</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Create Account</a>
          }
        </div>
      </div>
    </header>

    <!-- Runtime API Configuration Modal -->
    @if (isApiModalOpen) {
      <app-api-config-modal
        [isOpen]="isApiModalOpen"
        (closeRequested)="closeApiModal()"
      ></app-api-config-modal>
    }
  `,
  styles: [`
    .navbar-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.75rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
    }
    .brand-logo {
      text-decoration: none;
    }
    .logo-box {
      width: 38px;
      height: 38px;
      background: var(--gradient-ig-rich);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(225, 48, 108, 0.25);
    }
    .logo-svg {
      width: 20px;
      height: 20px;
    }
    .brand-title {
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #0f172a;
      line-height: 1;
    }
    .brand-gradient-text {
      background: linear-gradient(135deg, #e1306c, #dd2a7b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-left: 2px;
    }
    .hardware-tag {
      font-size: 0.6rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .brand-subtitle {
      display: block;
      font-size: 0.625rem;
      letter-spacing: 0.08em;
      color: #64748b;
      font-weight: 600;
      margin-top: 3px;
    }
    .nav-segmented {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-full);
      padding: 3px;
    }
    .nav-tab {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      color: #64748b;
      font-size: 0.8125rem;
      font-weight: 600;
      border-radius: var(--radius-full);
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .tab-icon {
      width: 14px;
      height: 14px;
      opacity: 0.75;
    }
    .nav-tab:hover {
      color: #0f172a;
    }
    .nav-tab.active {
      color: #0f172a;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
    }
    .nav-tab.active .tab-icon {
      color: #e1306c;
      opacity: 1;
    }
    .api-endpoint-pill {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-full);
      color: #065f46;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .api-endpoint-pill:hover {
      background: #d1fae5;
      border-color: #6ee7b7;
    }
    .api-radar-pulse {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 8px;
      height: 8px;
    }
    .radar-ping {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #10b981;
      opacity: 0.65;
      animation: radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .radar-dot {
      position: relative;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
    @keyframes radarPing {
      75%, 100% {
        transform: scale(2.6);
        opacity: 0;
      }
    }
    .api-label {
      font-size: 0.75rem;
      font-weight: 700;
    }
    .gear-icon {
      width: 12px;
      height: 12px;
      opacity: 0.7;
    }
    .user-profile-chip {
      background: #ffffff;
      border: 1px solid var(--border-subtle);
      padding: 0.25rem 0.75rem 0.25rem 0.25rem;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-xs);
    }
    .user-avatar-ring {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--gradient-ig);
      padding: 1.5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-initial {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #0f172a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .user-meta {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #0f172a;
      line-height: 1;
    }
    .user-role-badge {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .badge-superadmin { color: #db2777; }
    .badge-admin { color: #2563eb; }
    .badge-support { color: #d97706; }
    .badge-customer { color: #059669; }

    .btn-icon-logout {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: #ffffff;
      border: 1px solid var(--border-subtle);
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: var(--shadow-xs);
    }
    .btn-icon-logout svg {
      width: 15px;
      height: 15px;
    }
    .btn-icon-logout:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #ef4444;
    }
  `]
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly configService = inject(ConfigService);
  private readonly router = inject(Router);

  isApiModalOpen = false;

  getShortApiUrl(): string {
    const url = this.configService.apiUrl();
    if (!url) return 'PROXY';
    try {
      const parsed = new URL(url);
      return parsed.port ? `:${parsed.port}` : parsed.hostname;
    } catch {
      return url;
    }
  }

  openApiModal(): void {
    this.isApiModalOpen = true;
  }

  closeApiModal(): void {
    this.isApiModalOpen = false;
    this.authService.restoreSession().subscribe();
  }

  getRoleBadgeClass(): string {
    const roles = this.authService.roles();
    if (roles.includes('SuperAdmin')) return 'badge-superadmin';
    if (roles.includes('Admin')) return 'badge-admin';
    if (roles.includes('Support')) return 'badge-support';
    return 'badge-customer';
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
