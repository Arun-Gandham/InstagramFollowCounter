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
        <!-- Banner Alerts (Toast) -->
        @if (successMessage) {
          <div class="toast-alert alert-success mt-4" [class.toast-closing]="isSuccessToastClosing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div class="flex-1 font-medium">{{ successMessage }}</div>
            <button (click)="successMessage = ''" class="toast-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        }
        @if (errorMessage) {
          <div class="toast-alert alert-danger mt-4" [class.toast-closing]="isErrorToastClosing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div class="flex-1 font-medium">{{ errorMessage }}</div>
            <button (click)="errorMessage = ''" class="toast-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        }

        <!-- Centerpiece: Architectural Counter Showroom Stage -->
        <div class="counter-stage-wrapper mt-6">
          <div class="counter-stage">
            <!-- Stage Top Bar -->
            <div class="stage-header flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-3 flex-wrap">
                @if (activeAccount) {
                  <div class="feed-badge flex items-center gap-2">
                    <span class="feed-name font-mono">
                      {{ '@' + activeAccount.username }}
                    </span>
                  </div>
                }
                @if (activeLinkedDevices.length > 0) {
                  <div class="stage-device-switcher flex items-center gap-2">
                    <span class="switcher-label">ACTIVE COUNTER:</span>
                    <select
                      [ngModel]="selectedDevice?.id"
                      (ngModelChange)="onSelectDeviceById($event)"
                      class="custom-select text-xs font-mono bg-white border border-slate-300 rounded px-2 py-1"
                    >
                      @for (dev of activeLinkedDevices; track dev.id) {
                        <option [value]="dev.id">
                          {{ dev.nickname ? dev.nickname + ' (' + dev.serialNumber + ')' : dev.serialNumber }}
                        </option>
                      }
                    </select>
                  </div>
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

              </div>
            </div>

            <!-- Mechanical Split-Flap Stage Canvas with Dynamic Digit Count -->
            <div class="stage-canvas flex justify-center py-10 px-4">
              <app-split-flap-display
                [count]="currentFollowerCount"
                [digitCount]="activeDigitCount"
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
                  @if (activeAccount) {
                    <span class="telemetry-value font-mono">
                      #{{ activeAccount.followerSequence ?? 0 }}
                    </span>
                    <span class="tag-synced">VERIFIED</span>
                  } @else {
                    <span class="telemetry-value font-mono text-dim">--</span>
                  }
                </div>
              </div>

              <div class="telemetry-cell">
                <span class="telemetry-label">DRUM CONFIGURATION</span>
                <span class="telemetry-value font-mono text-sm">
                  {{ activeDigitCount }} REELS (MODEL FC-0{{ activeDigitCount }})
                </span>
              </div>

              <div class="telemetry-cell">
                <span class="telemetry-label">TARGET TERMINAL</span>
                <span class="telemetry-value font-mono text-sm truncate" [title]="selectedDevice?.serialNumber || 'Unassigned'">
                  @if (selectedDevice) {
                    @if (selectedDevice.nickname) {
                      {{ selectedDevice.nickname }} <span class="text-dim">({{ selectedDevice.serialNumber }})</span>
                    } @else {
                      {{ selectedDevice.serialNumber }}
                    }
                  } @else {
                    None Assigned
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Management Columns: Hardware Units & Creator Accounts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          <!-- Column 1: Hardware Units with Model Drum Sizes & Showroom Selector -->
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
                        <div class="hardware-chip flex items-center gap-2">
                          <span class="chip-dot"></span>
                          <span class="font-mono font-bold text-heading text-xs tracking-wider">
                            @if (device.nickname) {
                              {{ device.nickname }} <span class="text-dim font-normal">({{ device.serialNumber }})</span>
                            } @else {
                              {{ device.serialNumber }}
                            }
                          </span>
                          <button 
                            type="button" 
                            class="text-dim hover:text-ig p-1 ml-1" 
                            title="Edit Counter Nickname"
                            (click)="openEditNicknameModal(device)"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </button>
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
                            [value]="device.linkedInstagramAccount?.id ?? ''"
                            (change)="onBindDevice(device, $event)"
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

                    <!-- Showroom Broadcast & Drum Configuration Row -->
                    <div class="showroom-row flex items-center justify-between pt-3 mt-3 border-t border-subtle">
                      <div class="flex items-center gap-2">
                        @if (device.status === 'Active' && device.linkedInstagramAccount) {
                          @if (selectedDevice?.id === device.id) {
                            <span class="live-pill">
                              <span class="pulse-dot"></span>
                              BROADCASTING ON SHOWROOM
                            </span>
                          } @else {
                            <button
                              type="button"
                              (click)="selectDevice(device)"
                              class="btn btn-secondary btn-xs flex items-center gap-1.5"
                              title="Display this unit on the showroom counter stage"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                              </svg>
                              <span>View on Counter</span>
                            </button>
                          }
                        } @else {
                          @if (device.status !== 'Active') {
                            <span class="text-xs text-dim italic">Hardware inactive</span>
                          } @else {
                            <span class="text-xs text-danger font-medium italic">Link Instagram feed to broadcast</span>
                          }
                        }
                      </div>

                      <div class="drum-meta font-mono text-xs text-muted flex items-center gap-1.5">
                        <span>Hardware Reel:</span>
                        <strong class="text-heading font-bold">FC-0{{ device.digitCount || 7 }}</strong>
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
        <!-- Edit Nickname Modal -->
        @if (showEditNicknameModal) {
          <div class="modal-backdrop" (click)="closeEditNicknameModal()">
            <div class="modal-content" style="max-width: 400px" (click)="$event.stopPropagation()">
              <div class="modal-top flex items-center justify-between p-6 border-b border-subtle">
                <div class="flex items-center gap-3">
                  <div class="modal-badge-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-heading">Counter Nickname</h3>
                    <p class="text-xs text-muted">Set a friendly name for this display</p>
                  </div>
                </div>
                <button (click)="closeEditNicknameModal()" class="btn-close">✕</button>
              </div>
              <div class="p-6">
                <form (ngSubmit)="onNicknameSubmit()">
                  <div class="form-group mb-6">
                    <label class="form-label text-xs uppercase tracking-wider text-muted flex items-center justify-between" for="nicknameInput">
                      <span>Friendly Name</span>
                      <span class="text-dim font-normal lowercase">Max 50 chars</span>
                    </label>
                    <input
                      id="nicknameInput"
                      type="text"
                      name="nickname"
                      [(ngModel)]="editNicknameValue"
                      placeholder="e.g., Downtown Store Front"
                      class="form-control text-sm font-medium"
                      maxlength="50"
                    />
                    <p class="text-xs text-dim mt-2 leading-relaxed">Leave this field blank to revert back to using the default hardware serial number.</p>
                  </div>
                  <div class="modal-footer-row flex items-center justify-end gap-2 pt-4 border-t border-subtle">
                    <button type="button" (click)="closeEditNicknameModal()" class="btn btn-secondary btn-sm">Cancel</button>
                    <button type="submit" [disabled]="isSavingNickname" class="btn btn-primary btn-sm flex items-center gap-2">
                      @if (isSavingNickname) {
                        <span>Saving...</span>
                      } @else {
                        <span>Save Nickname</span>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }

        <!-- Confirm Bind Modal -->
        @if (showBindConfirmModal) {
          <div class="modal-backdrop" (click)="cancelBind()">
            <div class="modal-content" style="max-width: 400px" (click)="$event.stopPropagation()">
              <div class="modal-top flex items-center justify-between p-6 border-b border-subtle">
                <div class="flex items-center gap-3">
                  <div class="modal-badge-icon" style="background: #fef2f2; border-color: #fecaca; color: #dc2626;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-heading">Confirm Action</h3>
                    <p class="text-xs text-muted">Update active counter feed</p>
                  </div>
                </div>
                <button (click)="cancelBind()" class="btn-close">✕</button>
              </div>
              <div class="p-6">
                <p class="text-sm text-heading font-medium leading-relaxed mb-6">
                  {{ bindConfirmMessage }}
                </p>
                <div class="modal-footer-row flex items-center justify-end gap-2 pt-4 border-t border-subtle">
                  <button type="button" (click)="cancelBind()" class="btn btn-secondary btn-sm">Cancel</button>
                  <button type="button" (click)="confirmBind()" class="btn btn-primary btn-sm bg-danger border-transparent" style="background-color: #dc2626; color: white;">
                    Confirm
                  </button>
                </div>
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
    .stage-device-switcher {
      background: #f1f5f9;
      padding: 3px 6px;
      border-radius: var(--radius-sm);
      border: 1px solid #e2e8f0;
    }
    .switcher-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .device-segmented-control {
      display: inline-flex;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      overflow: hidden;
      gap: 1px;
    }
    .device-segmented-btn {
      border: none;
      background: transparent;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
    }
    .device-segmented-btn:hover {
      color: #0f172a;
      background: #f8fafc;
    }
    .device-segmented-btn.active {
      background: #0f172a;
      color: #ffffff;
    }
    .device-segmented-btn .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
    }
    .device-segmented-btn.active .dot {
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .drum-pill {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(100, 116, 139, 0.15);
      color: inherit;
    }
    .device-segmented-btn.active .drum-pill {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
    .single-device-tag {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .drum-tag {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
    }
    .drum-model-tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #475569;
      font-size: 0.7rem;
    }
    .drum-spec-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      background: #f8fafc;
      border: 1px solid var(--border-default);
    }
    .drum-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .drum-val {
      font-size: 0.75rem;
      font-weight: 700;
      color: #0f172a;
    }
    .stage-canvas {
      background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f8fafc 100%);
    }
    .stage-telemetry {
      padding: 1.5rem;
      background: #ffffff;
      border-top: 1px solid var(--border-subtle);
      border-bottom-left-radius: var(--radius-lg);
      border-bottom-right-radius: var(--radius-lg);
    }
    .telemetry-cell {
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
      transition: border-color 0.2s;
    }
    .telemetry-cell:hover {
      border-color: #cbd5e1;
    }
    .telemetry-label {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #64748b;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .telemetry-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
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
  selectedDevice: Device | null = null;

  activeDigitCount = 7;
  currentFollowerCount = 0;
  isRefreshing = false;
  isDevelopment = true;

  // Claim Modal State
  showClaimModal = false;
  claimSerial = '';
  claimCode = '';
  isClaiming = false;
  claimErrorMessage = '';

  private _successMessage = '';
  private _errorMessage = '';
  isSuccessToastClosing = false;
  isErrorToastClosing = false;
  private toastTimeout: any;

  get successMessage(): string { return this._successMessage; }
  set successMessage(val: string) {
    if (val) {
      this.isSuccessToastClosing = false;
      this._successMessage = val;
      this.startToastTimer('success');
    } else {
      this.closeSuccessToast();
    }
  }

  get errorMessage(): string { return this._errorMessage; }
  set errorMessage(val: string) {
    if (val) {
      this.isErrorToastClosing = false;
      this._errorMessage = val;
      this.startToastTimer('error');
    } else {
      this.closeErrorToast();
    }
  }

  private startToastTimer(type: 'success' | 'error'): void {
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      if (type === 'success') this.closeSuccessToast();
      if (type === 'error') this.closeErrorToast();
    }, 4500); // Start exit animation at 4.5s
  }

  private closeSuccessToast(): void {
    if (!this._successMessage) return;
    this.isSuccessToastClosing = true;
    setTimeout(() => {
      this._successMessage = '';
      this.isSuccessToastClosing = false;
    }, 400);
  }

  private closeErrorToast(): void {
    if (!this._errorMessage) return;
    this.isErrorToastClosing = true;
    setTimeout(() => {
      this._errorMessage = '';
      this.isErrorToastClosing = false;
    }, 400);
  }

  // Nickname Modal State
  showEditNicknameModal = false;
  editNicknameDeviceId = '';
  editNicknameValue = '';
  isSavingNickname = false;

  openEditNicknameModal(device: Device): void {
    this.showEditNicknameModal = true;
    this.editNicknameDeviceId = device.id;
    this.editNicknameValue = device.nickname || '';
  }

  closeEditNicknameModal(): void {
    this.showEditNicknameModal = false;
    this.editNicknameDeviceId = '';
    this.editNicknameValue = '';
  }

  onNicknameSubmit(): void {
    if (!this.editNicknameDeviceId) return;
    
    this.isSavingNickname = true;
    this.deviceService.updateNickname(this.editNicknameDeviceId, this.editNicknameValue || null).subscribe({
      next: () => {
        this.isSavingNickname = false;
        this.closeEditNicknameModal();
        this.successMessage = 'Nickname updated successfully.';
        this.loadData();
      },
      error: (err) => {
        this.isSavingNickname = false;
        this.errorMessage = err.message || 'Failed to update nickname.';
      }
    });
  }

  /**
   * Filter active devices that have an assigned Instagram account
   */
  get activeLinkedDevices(): Device[] {
    return this.devices.filter(
      (d) => d.status === 'Active' && !!d.linkedInstagramAccount
    );
  }

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

  selectDevice(device: Device): void {
    this.selectedDevice = device;
    this.activeDigitCount = device.digitCount || 7;

    if (device.linkedInstagramAccount) {
      const matched = this.accounts.find((a) => a.id === device.linkedInstagramAccount?.id);
      this.activeAccount = matched || {
        id: device.linkedInstagramAccount.id,
        instagramUserId: device.linkedInstagramAccount.id,
        username: device.linkedInstagramAccount.username,
        connectionStatus: device.linkedInstagramAccount.connectionStatus,
        followerCount: device.linkedInstagramAccount.followerCount,
        followerSequence: 0,
        requiresReauthorization: false,
        createdAt: new Date().toISOString()
      };
      this.currentFollowerCount =
        this.activeAccount?.followerCount ??
        device.linkedInstagramAccount.followerCount ??
        0;
    } else {
      this.activeAccount = null;
      this.currentFollowerCount = 0;
    }
  }

  private updateActiveDisplay(): void {
    // 1. If currently selected device exists, refresh its state
    if (this.selectedDevice) {
      const current = this.devices.find((d) => d.id === this.selectedDevice!.id);
      if (current) {
        this.selectDevice(current);
        return;
      }
    }

    // 2. Otherwise default to first available device (prioritize active linked, then any device)
    if (this.devices.length > 0) {
      const firstLinked = this.activeLinkedDevices[0];
      this.selectDevice(firstLinked || this.devices[0]);
    } else {
      this.selectedDevice = null;
      this.activeAccount = null;
      this.currentFollowerCount = 0;
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

  showBindConfirmModal = false;
  bindConfirmMessage = '';
  pendingBindDevice: Device | null = null;
  pendingBindAccountId = '';
  pendingBindSelect: HTMLSelectElement | null = null;

  onBindDevice(device: Device, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const instagramAccountId = select.value;
    const isDisconnect = !instagramAccountId;

    this.pendingBindDevice = device;
    this.pendingBindAccountId = instagramAccountId;
    this.pendingBindSelect = select;

    const actionText = isDisconnect ? 'disconnect the active feed from this counter' : 'change the active feed for this counter';
    this.bindConfirmMessage = `Are you sure you want to ${actionText}?`;
    this.showBindConfirmModal = true;
  }

  cancelBind(): void {
    this.showBindConfirmModal = false;
    if (this.pendingBindSelect && this.pendingBindDevice) {
      this.pendingBindSelect.value = this.pendingBindDevice.linkedInstagramAccount?.id ?? '';
    }
    this.pendingBindDevice = null;
    this.pendingBindSelect = null;
  }

  confirmBind(): void {
    this.showBindConfirmModal = false;
    const device = this.pendingBindDevice!;
    const instagramAccountId = this.pendingBindAccountId;
    const select = this.pendingBindSelect!;
    const isDisconnect = !instagramAccountId;

    if (isDisconnect) {
      this.deviceService.unbindInstagram(device.id).subscribe({
        next: () => {
          this.successMessage = 'Counter unlinked from Instagram.';
          this.loadData();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to unbind counter.';
          select.value = device.linkedInstagramAccount?.id ?? '';
        }
      });
      return;
    }

    this.deviceService.bindInstagram(device.id, instagramAccountId).subscribe({
      next: () => {
        this.successMessage = 'Counter successfully bound to Instagram!';
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to bind counter.';
        select.value = device.linkedInstagramAccount?.id ?? '';
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
  onSelectDeviceById(deviceId: string): void {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (dev) {
      this.selectDevice(dev);
    }
  }
}
