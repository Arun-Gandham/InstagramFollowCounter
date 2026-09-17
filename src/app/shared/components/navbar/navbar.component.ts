import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-header" role="banner">
      <div class="fluid-container flex items-center justify-between">
        <!-- Brand Identity -->
        <a routerLink="/" (click)="closeMobileMenu()" class="brand-logo flex items-center gap-3" aria-label="Follower Counter Home">
          <div class="logo-box">
            <svg class="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4.2" stroke="white" stroke-width="2"/>
              <circle cx="17.2" cy="6.8" r="1.2" fill="white"/>
            </svg>
          </div>
          <div class="brand-text-group">
            <div class="flex items-center gap-2">
              <span class="brand-title font-heading">
                FOLLOWER<span class="brand-ig-gradient">COUNTER</span>
              </span>
              <span class="hardware-pill font-mono">HARDWARE</span>
            </div>
            <span class="brand-subtitle font-mono">LIVE INSTAGRAM DISPLAY CONSOLE</span>
          </div>
        </a>

        <!-- Desktop Segmented Navigation -->
        <nav class="nav-desktop flex items-center gap-1" aria-label="Main Navigation">
          @if (authService.isAuthenticated()) {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-tab">
              <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span>Dashboard</span>
            </a>

            @if (authService.isAdmin()) {
              <a routerLink="/admin/provisioning" routerLinkActive="active" class="nav-tab">
                <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                </svg>
                <span>Factory</span>
              </a>
              <a routerLink="/admin/users" routerLinkActive="active" class="nav-tab">
                <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <span>Users</span>
              </a>
              <a routerLink="/admin/overview" routerLinkActive="active" class="nav-tab">
                <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Fleet</span>
              </a>
            }
          }
        </nav>

        <!-- Right Side: User Profile & Mobile Toggle -->
        <div class="user-actions flex items-center gap-3">
          @if (authService.isAuthenticated()) {
            <!-- Desktop User Profile Pill -->
            <div class="user-profile-chip items-center gap-2" [title]="fullCleanDisplayName">
              <div class="user-avatar-ring">
                <span class="user-initial">{{ fullCleanDisplayName.charAt(0) || 'U' }}</span>
              </div>
              <div class="user-meta">
                <span class="user-name truncate">{{ cleanDisplayName }}</span>
                <span class="user-role-badge" [ngClass]="getRoleBadgeClass()">
                  {{ authService.roles()[0] || 'User' }}
                </span>
              </div>
            </div>

            <!-- Desktop Sign Out Button -->
            <button
              type="button"
              (click)="onLogout()"
              class="btn-icon-logout"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
              </svg>
            </button>
          } @else {
            <div class="auth-buttons-desktop flex items-center gap-2">
              <a routerLink="/login" class="btn btn-secondary btn-sm">Sign In</a>
              <a routerLink="/register" class="btn btn-ig btn-sm">Get Started</a>
            </div>
          }

          <!-- Mobile Hamburger Toggle Button -->
          <button
            type="button"
            class="mobile-menu-toggle"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="mobileMenuOpen"
            aria-label="Toggle navigation menu"
          >
            @if (mobileMenuOpen) {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            } @else {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Collapsible Mobile Navigation Drawer -->
      @if (mobileMenuOpen) {
        <div class="mobile-drawer" role="navigation" aria-label="Mobile Navigation">
          <div class="mobile-drawer-content">
            @if (authService.isAuthenticated()) {
              <!-- Mobile User Header -->
              <div class="mobile-user-card flex items-center justify-between p-3 mb-3" [title]="fullCleanDisplayName">
                <div class="flex items-center gap-3">
                  <div class="user-avatar-ring ring-lg">
                    <span class="user-initial text-sm">{{ fullCleanDisplayName.charAt(0) || 'U' }}</span>
                  </div>
                  <div>
                    <div class="font-bold text-heading text-sm">{{ cleanDisplayName }}</div>
                    <div class="text-xs text-muted font-mono">{{ authService.currentUser()?.email }}</div>
                  </div>
                </div>
                <span class="user-role-badge" [ngClass]="getRoleBadgeClass()">
                  {{ authService.roles()[0] || 'User' }}
                </span>
              </div>

              <!-- Mobile Nav Links -->
              <div class="mobile-nav-links flex flex-col gap-1">
                <a routerLink="/dashboard" (click)="closeMobileMenu()" routerLinkActive="active" class="mobile-nav-item">
                  <svg class="item-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                  <span>Dashboard</span>
                </a>

                @if (authService.isAdmin()) {
                  <div class="mobile-section-divider">ADMINISTRATION</div>
                  <a routerLink="/admin/provisioning" (click)="closeMobileMenu()" routerLinkActive="active" class="mobile-nav-item">
                    <svg class="item-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                    </svg>
                    <span>Device Factory</span>
                  </a>
                  <a routerLink="/admin/users" (click)="closeMobileMenu()" routerLinkActive="active" class="mobile-nav-item">
                    <svg class="item-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    <span>User Management</span>
                  </a>
                  <a routerLink="/admin/overview" (click)="closeMobileMenu()" routerLinkActive="active" class="mobile-nav-item">
                    <svg class="item-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Fleet Health</span>
                  </a>
                }
              </div>

              <!-- Mobile Sign Out -->
              <div class="mobile-drawer-footer pt-3 mt-3 border-t border-subtle">
                <button
                  type="button"
                  (click)="onLogout(); closeMobileMenu()"
                  class="btn btn-danger btn-sm w-full flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
                  </svg>
                  <span>Sign Out of Account</span>
                </button>
              </div>
            } @else {
              <div class="mobile-auth-actions flex flex-col gap-2 p-2">
                <a routerLink="/login" (click)="closeMobileMenu()" class="btn btn-secondary w-full">Sign In</a>
                <a routerLink="/register" (click)="closeMobileMenu()" class="btn btn-ig w-full">Create Free Account</a>
              </div>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar-header {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid #e8e5df;
      padding: 0.65rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px 0 rgba(28, 25, 23, 0.04);
    }
    .brand-logo {
      text-decoration: none;
      user-select: none;
    }
    .logo-box {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(221, 42, 123, 0.32);
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }
    .brand-logo:hover .logo-box {
      transform: scale(1.03);
    }
    .logo-svg {
      width: 20px;
      height: 20px;
    }
    .brand-title {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: #181513;
      line-height: 1;
    }
    .brand-ig-gradient {
      background: linear-gradient(135deg, #e1306c 0%, #c13584 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-left: 2px;
    }
    .hardware-pill {
      font-size: 0.58rem;
      font-weight: 800;
      padding: 0.12rem 0.4rem;
      background: #fdf2f4;
      border: 1px solid #fbcfe8;
      color: #be185d;
      border-radius: 4px;
      letter-spacing: 0.07em;
    }
    .brand-subtitle {
      display: block;
      font-size: 0.6rem;
      letter-spacing: 0.08em;
      color: #716b67;
      font-weight: 600;
      margin-top: 2px;
    }
    .fluid-container {
      width: 100%;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    /* Desktop Navigation Segment */
    .nav-desktop {
      display: inline-flex;
      background: #f6f3ee;
      border: 1px solid #e5e0d8;
      border-radius: var(--radius-full);
      padding: 3px;
    }
    .nav-tab {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.95rem;
      color: #645e59;
      font-size: 0.8125rem;
      font-weight: 600;
      border-radius: var(--radius-full);
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
    }
    .tab-icon {
      width: 15px;
      height: 15px;
      opacity: 0.7;
    }
    .nav-tab:hover {
      color: #181513;
      background: rgba(255, 255, 255, 0.65);
    }
    .nav-tab.active {
      color: #181513;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08);
    }
    .nav-tab.active .tab-icon {
      color: #e1306c;
      opacity: 1;
    }

    /* User Profile Pill */
    .user-profile-chip {
      display: inline-flex;
      background: #ffffff;
      border: 1px solid #e5e0d8;
      padding: 0.25rem 0.75rem 0.25rem 0.25rem;
      border-radius: var(--radius-full);
      box-shadow: 0 1px 2px rgba(28, 25, 23, 0.04);
    }
    .user-avatar-ring {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%);
      padding: 1.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-avatar-ring.ring-lg {
      width: 36px;
      height: 36px;
      padding: 2px;
    }
    .user-initial {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #181513;
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
      max-width: 130px;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: #181513;
      line-height: 1.1;
    }
    .user-role-badge {
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 2px;
      line-height: 1;
    }
    .badge-superadmin { color: #db2777; }
    .badge-admin { color: #2563eb; }
    .badge-support { color: #d97706; }
    .badge-customer { color: #059669; }

    /* Sign Out Button */
    .btn-icon-logout {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      background: #ffffff;
      border: 1px solid #e5e0d8;
      color: #716b67;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(28, 25, 23, 0.04);
    }
    .btn-icon-logout svg {
      width: 16px;
      height: 16px;
    }
    .btn-icon-logout:hover {
      background: #fdf2f4;
      border-color: #fecdd3;
      color: #e1306c;
    }

    /* Mobile Hamburger Toggle */
    .mobile-menu-toggle {
      display: none;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: #f6f3ee;
      border: 1px solid #e5e0d8;
      color: #181513;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .mobile-menu-toggle:hover {
      background: #ede8df;
      color: #e1306c;
    }

    /* Mobile Collapsible Drawer */
    .mobile-drawer {
      display: block;
      width: 100%;
      background: #ffffff;
      border-top: 1px solid #e8e5df;
      box-shadow: 0 8px 16px rgba(28, 25, 23, 0.08);
      animation: mobileDrawerSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes mobileDrawerSlide {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .mobile-drawer-content {
      padding: 1rem 1.25rem 1.25rem;
    }
    .mobile-user-card {
      background: #f9f7f4;
      border: 1px solid #e8e5df;
      border-radius: 8px;
    }
    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #4a4541;
      text-decoration: none;
      transition: all 0.15s ease;
      min-height: 44px;
    }
    .mobile-nav-item .item-icon {
      width: 18px;
      height: 18px;
      color: #8c837b;
    }
    .mobile-nav-item:hover {
      background: #f6f3ee;
      color: #181513;
    }
    .mobile-nav-item.active {
      background: #fdf2f4;
      color: #be185d;
      font-weight: 700;
    }
    .mobile-nav-item.active .item-icon {
      color: #e1306c;
    }
    .mobile-section-divider {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #a8a29e;
      padding: 0.5rem 0.85rem 0.25rem;
      margin-top: 0.5rem;
    }

    /* Responsive Breakpoints */
    @media (max-width: 880px) {
      .nav-desktop {
        display: none;
      }
      .user-profile-chip {
        display: none;
      }
      .btn-icon-logout {
        display: none;
      }
      .auth-buttons-desktop {
        display: none;
      }
      .mobile-menu-toggle {
        display: flex;
      }
      .fluid-container {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }

    @media (max-width: 480px) {
      .brand-subtitle {
        display: none;
      }
      .hardware-pill {
        display: none;
      }
      .brand-title {
        font-size: 0.9rem;
      }
      .logo-box {
        width: 34px;
        height: 34px;
      }
      .logo-svg {
        width: 18px;
        height: 18px;
      }
    }
  `]
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly configService = inject(ConfigService);
  private readonly router = inject(Router);

  mobileMenuOpen = false;

  get fullCleanDisplayName(): string {
    const rawName = this.authService.currentUser()?.displayName || 'User';
    // Strip any role or text in parentheses, e.g. "Arun Sai Gandham (Super Admin)" -> "Arun Sai Gandham"
    return rawName.replace(/\s*\([^)]*\)/g, '').trim();
  }

  get cleanDisplayName(): string {
    const name = this.fullCleanDisplayName;
    // Max 15 characters, show ellipsis if more
    return name.length > 15 ? name.slice(0, 15) + '...' : name;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  getRoleBadgeClass(): string {
    const roles = this.authService.roles();
    if (roles.includes('SuperAdmin')) return 'badge-superadmin';
    if (roles.includes('Admin')) return 'badge-admin';
    if (roles.includes('Support')) return 'badge-support';
    return 'badge-customer';
  }

  onLogout(): void {
    this.closeMobileMenu();
    this.authService.logout().subscribe();
  }
}
