import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Device } from '../../../core/models/device.models';
import { InstagramAccount } from '../../../core/models/instagram.models';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { DeviceService } from '../../../core/services/device.service';
import { InstagramService } from '../../../core/services/instagram.service';
import { SplitFlapDisplayComponent } from '../../../shared/components/split-flap-display/split-flap-display.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SplitFlapDisplayComponent, StatusBadgeComponent],
  template: `
    <div class="dashboard-page">
      <div class="container">
        <!-- Top Executive Welcome & Quick Actions -->
        <div class="welcome-section flex items-center justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="live-pill">
                <span class="pulse-dot"></span>
                LIVE REEL TELEMETRY
              </span>
              <span class="build-tag font-mono">FIRMWARE v2.4.0</span>
            </div>
            <h1 class="page-title text-2xl font-extrabold text-heading flex items-center gap-2">
              Hardware Console
              <span class="text-muted font-normal text-lg">— {{ authService.currentUser()?.displayName }}</span>
            </h1>
            <p class="subtitle text-sm text-muted mt-1">
              Real-time synchronization and electro-mechanical reel provisioning
            </p>
          </div>

          <div class="action-buttons flex items-center gap-3">
            <button (click)="openClaimModal()" class="btn btn-secondary flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span>Pair Counter</span>
            </button>

            <button (click)="connectInstagram()" class="btn btn-ig flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Connect Instagram</span>
            </button>
          </div>
        </div>

        <!-- Banner Alerts -->
        @if (successMessage) {
          <div class="alert alert-success mt-4 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div class="flex-1 font-medium">{{ successMessage }}</div>
            <button (click)="successMessage = ''" class="text-dim hover:text-heading">✕</button>
          </div>
        }
        @if (errorMessage) {
          <div class="alert alert-danger mt-4 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div class="flex-1 font-medium">{{ errorMessage }}</div>
            <button (click)="errorMessage = ''" class="text-dim hover:text-heading">✕</button>
          </div>
        }

        <!-- Centerpiece: Architectural Counter Showroom Stage -->
        <div class="counter-stage-wrapper mt-6">
          <div class="counter-stage">
            <!-- Stage Top Bar -->
            <div class="stage-header flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-3">
                <div class="feed-badge flex items-center gap-2">
                  <span class="active-dot"></span>
                  <span class="feed-name font-mono">
                    {{ activeAccount ? '@' + activeAccount.username : 'NO INSTAGRAM LINKED' }}
                  </span>
                </div>
                @if (activeAccount) {
                  <app-status-badge [status]="activeAccount.connectionStatus"></app-status-badge>
                }
              </div>

              <div class="stage-controls flex items-center gap-3">
                @if (activeAccount) {
                  <button
                    (click)="onRefreshFollowers(activeAccount.id)"
                    [disabled]="isRefreshing"
                    class="btn btn-secondary btn-sm flex items-center gap-2"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      [class.spin-animate]="isRefreshing"
                    >
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    <span>{{ isRefreshing ? 'Syncing...' : 'Sync Follower Count' }}</span>
                  </button>
                }

                @if (isDevelopment) {
                  <button
                    (click)="simulateFollowerIncrement()"
                    class="btn btn-secondary btn-sm flex items-center gap-1.5 border-dashed"
                    title="Simulate follower increment to trigger real mechanical flip"
                  >
                    <span class="text-ig-coral font-bold">+5</span>
                    <span>Test Flip</span>
                  </button>
                }
              </div>
            </div>

            <!-- Mechanical Split-Flap Stage Canvas -->
            <div class="stage-canvas flex justify-center py-10 px-4">
              <app-split-flap-display
                [count]="currentFollowerCount"
                [digitCount]="7"
              ></app-split-flap-display>
            </div>

            <!-- Telemetry Metrics Bar -->
            <div class="stage-telemetry grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="telemetry-cell">
                <span class="telemetry-label">AUDIENCE METRIC</span>
                <span class="telemetry-value font-mono text-gradient-ig">
                  {{ currentFollowerCount | number }}
                </span>
              </div>

              <div class="telemetry-cell">
                <span class="telemetry-label">REEL SEQUENCE</span>
                <div class="flex items-center gap-2">
                  <span class="telemetry-value font-mono">
                    #{{ activeAccount?.followerSequence ?? 0 }}
                  </span>
                  <span class="tag-synced">VERIFIED</span>
                </div>
              </div>

              <div class="telemetry-cell">
                <span class="telemetry-label">LAST RECORDED STAMP</span>
                <span class="telemetry-value font-mono text-sm">
                  {{ activeAccount?.lastFollowerRefreshAt ? (activeAccount?.lastFollowerRefreshAt | date:'HH:mm:ss') : 'Idle' }}
                </span>
              </div>

              <div class="telemetry-cell">
                <span class="telemetry-label">TARGET TERMINAL</span>
                <span class="telemetry-value font-mono text-sm truncate" [title]="boundDevice?.serialNumber || 'Unassigned'">
                  {{ boundDevice ? boundDevice.serialNumber : 'None Assigned' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Management Columns: Hardware Units & Creator Accounts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          <!-- Column 1: Hardware Units -->
          <div class="card">
            <div class="card-header flex items-center justify-between pb-3 border-b border-subtle">
              <div class="flex items-center gap-2.5">
                <div class="section-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-heading">Physical Hardware Counters</h3>
                  <p class="text-xs text-muted">Active electro-mechanical units assigned to your account</p>
                </div>
              </div>

              <button (click)="openClaimModal()" class="btn btn-secondary btn-xs">+ Pair Unit</button>
            </div>

            @if (devices.length === 0) {
              <div class="empty-state-box">
                <div class="empty-icon-wrap">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <h4 class="font-bold text-heading text-sm mt-3">No Hardware Display Paired</h4>
                <p class="text-xs text-muted mt-1 max-w-xs mx-auto">
                  Unbox your physical counter and enter the serial number and claim code from the security card.
                </p>
                <button (click)="openClaimModal()" class="btn btn-primary btn-sm mt-4">
                  Pair Display Unit
                </button>
              </div>
            } @else {
              <div class="device-list flex flex-col gap-3 mt-4">
                @for (device of devices; track device.id) {
                  <div class="device-card p-4 rounded-lg border border-subtle bg-surface hover:border-strong transition-all">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-3">
                        <div class="hardware-chip">
                          <span class="chip-dot"></span>
                          <span class="font-mono font-bold text-heading text-xs tracking-wider">{{ device.serialNumber }}</span>
                        </div>
                        <app-status-badge [status]="device.status"></app-status-badge>
                      </div>

                      <div class="font-mono text-xs text-dim">
                        {{ device.firmwareVersion || 'FW v2.4.0' }}
                      </div>
                    </div>

                    <!-- Binding Row -->
                    <div class="binding-row flex items-center justify-between pt-3 border-t border-subtle">
                      <div class="text-xs text-muted flex items-center gap-2">
                        <span class="font-semibold text-heading">Active Feed:</span>
                        @if (device.linkedInstagramAccount) {
                          <span class="text-heading font-medium">
                            &#64;{{ device.linkedInstagramAccount.username }}
                          </span>
                        } @else {
                          <span class="text-warning font-mono text-xs">Unlinked (Idle)</span>
                        }
                      </div>

                      <div class="bind-select-wrap">
                        @if (accounts.length > 0) {
                          <select
                            [ngModel]="device.linkedInstagramAccount?.id ?? ''"
                            (ngModelChange)="onBindDevice(device.id, $event)"
                            class="custom-select text-xs font-mono"
                          >
                            <option value="">-- Disconnect Feed --</option>
                            @for (acc of accounts; track acc.id) {
                              <option [value]="acc.id">&#64;{{ acc.username }}</option>
                            }
                          </select>
                        } @else {
                          <span class="text-xs text-dim italic">Link IG first</span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Column 2: Instagram Accounts -->
          <div class="card">
            <div class="card-header flex items-center justify-between pb-3 border-b border-subtle">
              <div class="flex items-center gap-2.5">
                <div class="section-icon text-ig-coral">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-heading">Connected Instagram Accounts</h3>
                  <p class="text-xs text-muted">Professional Creator & Business profiles</p>
                </div>
              </div>

              <button (click)="connectInstagram()" class="btn btn-secondary btn-xs">+ Link Profile</button>
            </div>

            @if (accounts.length === 0) {
              <div class="empty-state-box">
                <div class="empty-icon-wrap text-ig-coral">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <h4 class="font-bold text-heading text-sm mt-3">No Instagram Account Connected</h4>
                <p class="text-xs text-muted mt-1 max-w-xs mx-auto">
                  Authorize your Creator or Business account via official Instagram Graph API OAuth to broadcast follower counts.
                </p>
                <button (click)="connectInstagram()" class="btn btn-ig btn-sm mt-4">
                  Connect Instagram Profile
                </button>
              </div>
            } @else {
              <div class="account-list flex flex-col gap-3 mt-4">
                @for (acc of accounts; track acc.id) {
                  <div class="account-card p-4 rounded-lg border border-subtle bg-surface hover:border-strong transition-all">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="creator-avatar-ring">
                          <div class="creator-avatar-inner">
                            <span class="font-bold text-xs text-heading">&#64;</span>
                          </div>
                        </div>
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-heading text-sm">&#64;{{ acc.username }}</span>
                            <app-status-badge [status]="acc.connectionStatus"></app-status-badge>
                          </div>
                          <div class="text-xs text-muted mt-0.5 flex items-center gap-2 font-mono">
                            <span class="text-heading font-bold">{{ acc.followerCount | number }}</span> followers
                            <span class="text-dim">• Seq #{{ acc.followerSequence }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="account-actions flex items-center gap-2">
                        @if (acc.connectionStatus === 'Disconnected' || acc.requiresReauthorization || acc.connectionStatus === 'ReauthorizationRequired') {
                          <button
                            (click)="connectInstagram()"
                            class="btn btn-ig btn-xs flex items-center gap-1"
                            title="Reconnect this Instagram account"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <polyline points="23 4 23 10 17 10"></polyline>
                              <polyline points="1 20 1 14 7 14"></polyline>
                              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            <span>Reconnect</span>
                          </button>
                        } @else {
                          <button
                            (click)="onRefreshFollowers(acc.id)"
                            [disabled]="isRefreshing"
                            class="btn btn-secondary btn-xs"
                            title="Sync follower metrics"
                          >
                            Sync
                          </button>
                          <button
                            (click)="onDisconnectAccount(acc.id)"
                            class="btn btn-danger btn-xs"
                            title="Disconnect account"
                          >
                            Unlink
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- 2-Step Retail Claim Modal -->
        @if (showClaimModal) {
          <div class="modal-backdrop" (click)="closeClaimModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <!-- Modal Top Header -->
              <div class="modal-top flex items-center justify-between p-6 border-b border-subtle">
                <div class="flex items-center gap-3">
                  <div class="modal-badge-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-heading">Pair Physical Counter</h3>
                    <p class="text-xs text-muted">Register electro-mechanical hardware unit</p>
                  </div>
                </div>
                <button (click)="closeClaimModal()" class="btn-close">✕</button>
              </div>

              <!-- Modal Body -->
              <div class="p-6">
                <!-- Hardware Rear Panel Schematic -->
                <div class="unboxing-schematic mb-5 p-4 rounded-lg bg-surface-subtle border border-subtle flex items-center gap-4">
                  <div class="schematic-art">
                    <svg width="75" height="48" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="5" width="150" height="90" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
                      <circle cx="15" cy="15" r="3" fill="#94a3b8"/>
                      <circle cx="145" cy="15" r="3" fill="#94a3b8"/>
                      <rect x="35" y="25" width="90" height="50" rx="4" fill="#f8fafc" stroke="#e1306c" stroke-width="1.5" stroke-dasharray="3 3"/>
                      <text x="80" y="45" fill="#e1306c" font-family="monospace" font-size="9" text-anchor="middle" font-weight="bold">SERIAL LABEL</text>
                      <text x="80" y="62" fill="#64748b" font-family="monospace" font-size="8" text-anchor="middle">FC-A82F32</text>
                    </svg>
                  </div>
                  <div class="schematic-info flex-1">
                    <h4 class="text-xs font-bold text-heading uppercase tracking-wider mb-1">Hardware Label</h4>
                    <p class="text-xs text-muted leading-relaxed">
                      Locate the laser-printed label on the rear panel of your unit. Enter the Serial Number and the 16-character scratch-off security claim code.
                    </p>
                  </div>
                </div>

                @if (claimErrorMessage) {
                  <div class="alert alert-danger mb-4 flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                    </svg>
                    <span class="text-xs font-medium">{{ claimErrorMessage }}</span>
                  </div>
                }

                <form (ngSubmit)="onClaimSubmit()">
                  <div class="form-group mb-4">
                    <label class="form-label text-xs uppercase tracking-wider text-muted flex items-center justify-between" for="serial">
                      <span>Serial Number</span>
                      <span class="text-dim font-normal lowercase">From rear panel</span>
                    </label>
                    <input
                      type="text"
                      id="serial"
                      name="serial"
                      [(ngModel)]="claimSerial"
                      required
                      placeholder="FC-A82F32"
                      class="form-control font-mono tracking-widest text-sm"
                    />
                  </div>

                  <div class="form-group mb-6">
                    <label class="form-label text-xs uppercase tracking-wider text-muted flex items-center justify-between" for="claimCode">
                      <span>Security Claim Code</span>
                      <span class="text-dim font-normal lowercase">From scratch-off card</span>
                    </label>
                    <input
                      type="text"
                      id="claimCode"
                      name="claimCode"
                      [(ngModel)]="claimCode"
                      required
                      placeholder="CLM-82F3-2ABC-9999"
                      class="form-control font-mono tracking-wider text-sm"
                    />
                  </div>

                  <!-- Footer Actions -->
                  <div class="modal-footer-row flex items-center justify-between pt-4 border-t border-subtle">
                    <button
                      type="button"
                      (click)="fillTestClaim()"
                      class="btn btn-secondary btn-xs flex items-center gap-1.5"
                    >
                      <span class="text-ig-coral font-bold">⚡</span>
                      <span>Fill Demo (FC-A82F32)</span>
                    </button>

                    <div class="flex items-center gap-2">
                      <button type="button" (click)="closeClaimModal()" class="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        [disabled]="!claimSerial || !claimCode || isClaiming"
                        class="btn btn-primary btn-sm flex items-center gap-2"
                      >
                        @if (isClaiming) {
                          <span>Verifying...</span>
                        } @else {
                          <span>Verify & Pair Unit</span>
                        }
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding-top: 2rem;
      padding-bottom: 4rem;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-canvas);
    }
    .page-title {
      letter-spacing: -0.025em;
    }
    .live-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #065f46;
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      animation: pulseDot 2s infinite ease-in-out;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }
    .build-tag {
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }
    .counter-stage-wrapper {
      background: #ffffff;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .counter-stage {
      display: flex;
      flex-direction: column;
    }
    .stage-header {
      padding: 1rem 1.5rem;
      background: #ffffff;
      border-bottom: 1px solid var(--border-subtle);
    }
    .feed-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      border-radius: 6px;
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
    }
    .active-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
    }
    .feed-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0f172a;
    }
    .stage-canvas {
      background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f8fafc 100%);
    }
    .stage-telemetry {
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid var(--border-subtle);
    }
    .telemetry-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .telemetry-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
    }
    .telemetry-value {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
    }
    .tag-synced {
      font-size: 0.6rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .section-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .empty-state-box {
      padding: 2.5rem 1rem;
      text-align: center;
      background: #f8fafc;
      border: 1px dashed var(--border-default);
      border-radius: var(--radius-md);
      margin-top: 1rem;
    }
    .empty-icon-wrap {
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .hardware-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
    }
    .chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
    .custom-select {
      background: #ffffff;
      border: 1px solid var(--border-default);
      color: #0f172a;
      border-radius: 6px;
      padding: 4px 8px;
      outline: none;
    }
    .custom-select:focus {
      border-color: var(--ig-coral);
    }
    .creator-avatar-ring {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      padding: 2px;
      background: var(--gradient-ig);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .creator-avatar-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-badge-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-close {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .border-subtle {
      border-color: var(--border-subtle);
    }
    .border-strong {
      border-color: var(--border-strong);
    }
    .spin-animate {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly configService = inject(ConfigService);
  private readonly deviceService = inject(DeviceService);
  private readonly instagramService = inject(InstagramService);
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);

  devices: Device[] = [];
  accounts: InstagramAccount[] = [];
  activeAccount: InstagramAccount | null = null;
  boundDevice: Device | null = null;

  currentFollowerCount = 0;
  isRefreshing = false;
  isDevelopment = true;

  // Claim Modal State
  showClaimModal = false;
  claimSerial = '';
  claimCode = '';
  isClaiming = false;
  claimErrorMessage = '';

  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadData();

    if (this.route.snapshot.queryParams['ig_connected']) {
      this.successMessage = 'Instagram account connected successfully!';
      this.loadData();
    }
  }

  loadData(): void {
    this.deviceService.getDevices().subscribe({
      next: (devices) => {
        this.devices = devices;
        this.updateActiveDisplay();
      },
      error: (err) => console.error('Failed to load devices', err)
    });

    this.instagramService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.updateActiveDisplay();
      },
      error: (err) => console.error('Failed to load accounts', err)
    });
  }

  private updateActiveDisplay(): void {
    if (this.accounts.length > 0) {
      this.activeAccount = this.accounts[0];
      this.currentFollowerCount = this.activeAccount.followerCount ?? 0;
    } else {
      this.activeAccount = null;
      this.currentFollowerCount = 0;
    }

    if (this.activeAccount && this.devices.length > 0) {
      this.boundDevice =
        this.devices.find((d) => d.linkedInstagramAccount?.id === this.activeAccount?.id) ??
        this.devices[0] ??
        null;
    } else if (this.devices.length > 0) {
      this.boundDevice = this.devices[0];
    } else {
      this.boundDevice = null;
    }
  }

  onRefreshFollowers(accountId: string): void {
    this.isRefreshing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.instagramService.refreshFollowers(accountId).subscribe({
      next: (res) => {
        this.isRefreshing = false;
        this.currentFollowerCount = res.followerCount;
        this.successMessage = res.changed
          ? `Follower count updated from ${res.previousCount} to ${res.followerCount}!`
          : `Followers verified. Count unchanged (${res.followerCount}).`;
        this.loadData();
      },
      error: (err) => {
        this.isRefreshing = false;
        this.errorMessage = err.message || 'Refresh failed. Please try again.';
      }
    });
  }

  connectInstagram(): void {
    const returnUrl = `${window.location.origin}/dashboard?ig_connected=true`;
    this.instagramService.getConnectUrl(returnUrl).subscribe({
      next: (res) => {
        const targetUrl = this.configService.getFullUrl(res.authorizationUrl);
        window.location.href = targetUrl;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Unable to initiate Instagram connect. Please ensure you are logged in.';
      }
    });
  }

  onDisconnectAccount(accountId: string): void {
    if (!confirm('Are you sure you want to disconnect this Instagram account?')) return;

    this.instagramService.disconnectAccount(accountId).subscribe({
      next: () => {
        this.successMessage = 'Instagram account disconnected.';
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to disconnect account.';
      }
    });
  }

  onBindDevice(deviceId: string, instagramAccountId: string): void {
    if (!instagramAccountId) {
      this.deviceService.unbindInstagram(deviceId).subscribe({
        next: () => {
          this.successMessage = 'Counter unlinked from Instagram.';
          this.loadData();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to unbind counter.';
        }
      });
      return;
    }

    this.deviceService.bindInstagram(deviceId, instagramAccountId).subscribe({
      next: () => {
        this.successMessage = 'Counter successfully bound to Instagram!';
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to bind counter.';
      }
    });
  }

  openClaimModal(): void {
    this.showClaimModal = true;
    this.claimErrorMessage = '';
  }

  closeClaimModal(): void {
    this.showClaimModal = false;
    this.claimSerial = '';
    this.claimCode = '';
  }

  fillTestClaim(): void {
    this.claimSerial = 'FC-A82F32';
    this.claimCode = 'CLM-82F3-2ABC-9999';
  }

  onClaimSubmit(): void {
    if (!this.claimSerial || !this.claimCode) return;

    this.isClaiming = true;
    this.claimErrorMessage = '';

    this.deviceService.claimDevice({
      serialNumber: this.claimSerial,
      claimCode: this.claimCode
    }).subscribe({
      next: (res) => {
        this.isClaiming = false;
        this.closeClaimModal();
        this.successMessage = `Hardware counter ${res.serialNumber} successfully paired!`;
        this.loadData();
      },
      error: (err) => {
        this.isClaiming = false;
        this.claimErrorMessage = err.message || 'Device claim failed. Check serial number and claim code.';
      }
    });
  }

  simulateFollowerIncrement(): void {
    this.adminService.incrementFakeFollowers(5).subscribe({
      next: (res) => {
        if (this.activeAccount) {
          this.onRefreshFollowers(this.activeAccount.id);
        } else {
          this.currentFollowerCount = res.currentFollowerCount;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Unable to increment fake followers.';
      }
    });
  }
}
