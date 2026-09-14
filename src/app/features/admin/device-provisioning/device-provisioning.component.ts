import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDevice, CreateDeviceResponse } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-device-provisioning',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div class="provisioning-page">
      <div class="container">
        <!-- Header -->
        <div class="header-bar flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-neutral font-mono">FACTORY STAGE 1</span>
              <span class="text-xs text-muted">SECURE PROVISIONING ENGINE</span>
            </div>
            <h1 class="text-2xl font-extrabold text-heading">Factory Device Provisioning</h1>
            <p class="subtitle text-sm text-muted mt-1">
              Issue cryptographic hardware credentials, flash tokens, and generate packaging unboxing claim cards
            </p>
          </div>

          <button (click)="generateNewSerial()" class="btn btn-primary flex items-center gap-2">
            <span>+ Provision New Unit</span>
          </button>
        </div>

        <!-- Generated Device Packaging Card (Print Ready) -->
        @if (latestProvisioned) {
          <div class="card label-print-card mb-6 animate-fade-in">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-subtle">
              <div class="flex items-center gap-2">
                <span class="badge badge-success">READY FOR PACKAGING</span>
                <span class="text-xs text-muted">Generated unit ready to be printed and flashed</span>
              </div>
              <button (click)="printLabel()" class="btn btn-secondary btn-sm flex items-center gap-1.5">
                <span>🖨️</span>
                <span>Print Packaging Label</span>
              </button>
            </div>

            <div class="thermal-label-box">
              <div class="label-header flex justify-between items-center pb-3 border-b border-dashed border-subtle">
                <div>
                  <span class="label-brand">FOLLOWER COUNTER • MODEL FC-07 MECHANICAL</span>
                  <div class="text-xs text-muted mt-0.5">AUTHENTIC ELECTRO-MECHANICAL PRODUCT CERTIFICATE</div>
                </div>
                <span class="label-serial font-mono">{{ latestProvisioned.serialNumber }}</span>
              </div>

              <!-- Barcode Mock SVG -->
              <div class="barcode-row py-3 flex items-center justify-center">
                <svg width="240" height="40" viewBox="0 0 240 40" fill="#0f172a">
                  <rect x="0" y="0" width="3" height="40"/>
                  <rect x="5" y="0" width="2" height="40"/>
                  <rect x="10" y="0" width="4" height="40"/>
                  <rect x="17" y="0" width="1" height="40"/>
                  <rect x="21" y="0" width="5" height="40"/>
                  <rect x="29" y="0" width="2" height="40"/>
                  <rect x="34" y="0" width="3" height="40"/>
                  <rect x="40" y="0" width="4" height="40"/>
                  <rect x="47" y="0" width="1" height="40"/>
                  <rect x="51" y="0" width="6" height="40"/>
                  <rect x="60" y="0" width="2" height="40"/>
                  <rect x="65" y="0" width="4" height="40"/>
                  <rect x="72" y="0" width="3" height="40"/>
                  <rect x="78" y="0" width="2" height="40"/>
                  <rect x="83" y="0" width="5" height="40"/>
                  <rect x="91" y="0" width="1" height="40"/>
                  <rect x="95" y="0" width="3" height="40"/>
                  <rect x="101" y="0" width="4" height="40"/>
                  <rect x="108" y="0" width="2" height="40"/>
                  <rect x="113" y="0" width="5" height="40"/>
                  <rect x="121" y="0" width="1" height="40"/>
                  <rect x="125" y="0" width="4" height="40"/>
                  <rect x="132" y="0" width="2" height="40"/>
                  <rect x="137" y="0" width="3" height="40"/>
                  <rect x="143" y="0" width="5" height="40"/>
                  <rect x="151" y="0" width="2" height="40"/>
                  <rect x="156" y="0" width="4" height="40"/>
                  <rect x="163" y="0" width="1" height="40"/>
                  <rect x="167" y="0" width="3" height="40"/>
                  <rect x="173" y="0" width="5" height="40"/>
                  <rect x="181" y="0" width="2" height="40"/>
                  <rect x="186" y="0" width="4" height="40"/>
                  <rect x="193" y="0" width="1" height="40"/>
                  <rect x="197" y="0" width="5" height="40"/>
                  <rect x="205" y="0" width="3" height="40"/>
                  <rect x="211" y="0" width="2" height="40"/>
                  <rect x="216" y="0" width="4" height="40"/>
                  <rect x="223" y="0" width="1" height="40"/>
                  <rect x="227" y="0" width="5" height="40"/>
                  <rect x="235" y="0" width="3" height="40"/>
                </svg>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <!-- Firmware Secret -->
                <div class="credential-box">
                  <span class="cred-title">FIRMWARE FLASH SECRET (FLASH TO ESP32 ROM)</span>
                  <div class="cred-value font-mono">{{ latestProvisioned.plaintextDeviceSecret }}</div>
                  <span class="cred-note text-danger font-semibold">⚠️ Secret is NOT stored plaintext. Flash to hardware now!</span>
                </div>

                <!-- Customer Claim Code -->
                <div class="credential-box">
                  <span class="cred-title">CUSTOMER CLAIM CODE (PRINT ON UNBOXING CARD)</span>
                  <div class="cred-value font-mono text-heading font-bold">{{ latestProvisioned.plaintextClaimCode }}</div>
                  <span class="cred-note text-muted">Valid until: {{ latestProvisioned.claimExpiresAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Provision Modal -->
        @if (showProvisionModal) {
          <div class="modal-backdrop" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header flex items-center justify-between p-6 border-b border-subtle">
                <div>
                  <h3 class="text-base font-bold text-heading">Provision New Counter Unit</h3>
                  <p class="text-xs text-muted">Generate cryptographic keys and serial number</p>
                </div>
                <button (click)="closeModal()" class="btn-close">✕</button>
              </div>

              <div class="p-6">
                @if (errorMessage) {
                  <div class="alert alert-danger mb-4 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                    </svg>
                    <span>{{ errorMessage }}</span>
                  </div>
                }

                <form (ngSubmit)="onProvisionSubmit()">
                  <div class="form-group mb-6">
                    <label class="form-label" for="serial">Serial Number</label>
                    <div class="flex gap-2">
                      <input
                        type="text"
                        id="serial"
                        name="serial"
                        [(ngModel)]="newSerial"
                        required
                        class="form-control font-mono tracking-wider text-sm flex-1"
                        placeholder="FC-XXXXXX"
                      />
                      <button type="button" (click)="generateNewSerialString()" class="btn btn-secondary btn-sm">
                        🎲 Randomize
                      </button>
                    </div>
                  </div>

                  <div class="modal-actions flex items-center justify-between pt-4 border-t border-subtle">
                    <button type="button" (click)="closeModal()" class="btn btn-secondary btn-sm">Cancel</button>
                    <button
                      type="submit"
                      [disabled]="!newSerial || isProvisioning"
                      class="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      @if (isProvisioning) {
                        <span>Generating Keys...</span>
                      } @else {
                        <span>Generate & Register Credentials</span>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }

        <!-- Hardware Inventory Table -->
        <div class="card mt-6">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 class="text-base font-bold text-heading">Manufactured Hardware Inventory</h3>
              <p class="text-xs text-muted">Total registered and active devices in the fleet</p>
            </div>
            <button (click)="loadDevices()" class="btn btn-secondary btn-xs">Refresh Inventory</button>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Hardware Status</th>
                  <th>Firmware</th>
                  <th>Assigned Customer</th>
                  <th>Manufactured Date</th>
                  <th>Claimed Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (device of devices; track device.id) {
                  <tr>
                    <td class="font-mono font-bold text-heading">{{ device.serialNumber }}</td>
                    <td><app-status-badge [status]="device.status"></app-status-badge></td>
                    <td class="font-mono text-xs">{{ device.firmwareVersion || 'v1.0.0' }}</td>
                    <td>
                      @if (device.ownerEmail) {
                        <span class="text-sm font-medium text-heading">{{ device.ownerEmail }}</span>
                      } @else {
                        <span class="text-dim text-xs italic">Unassigned</span>
                      }
                    </td>
                    <td class="text-xs text-muted">{{ device.createdAt | date:'shortDate' }}</td>
                    <td class="text-xs text-muted">
                      {{ device.claimedAt ? (device.claimedAt | date:'shortDate') : '—' }}
                    </td>
                    <td>
                      <div class="flex gap-2">
                        @if (device.status === 'Unclaimed') {
                          <button
                            (click)="onResetClaim(device.id)"
                            class="btn btn-secondary btn-xs"
                            title="Generate new claim code"
                          >
                            Reset Code
                          </button>
                        }
                        @if (device.status !== 'Disabled') {
                          <button
                            (click)="onDisableDevice(device.id)"
                            class="btn btn-danger btn-xs"
                            title="Revoke device access"
                          >
                            Disable
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .provisioning-page {
      padding-top: 2rem;
      padding-bottom: 4rem;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-canvas);
    }
    .label-print-card {
      border: 2px dashed #cbd5e1;
      background: #ffffff;
    }
    .thermal-label-box {
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 1.5rem;
    }
    .label-brand {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #0f172a;
    }
    .label-serial {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
    }
    .credential-box {
      background: #ffffff;
      padding: 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }
    .cred-title {
      display: block;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      margin-bottom: 0.4rem;
    }
    .cred-value {
      font-size: 0.9rem;
      word-break: break-all;
      background: #f1f5f9;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }
    .cred-note {
      display: block;
      font-size: 0.75rem;
      margin-top: 0.35rem;
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
  `]
})
export class DeviceProvisioningComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  devices: AdminDevice[] = [];
  latestProvisioned: CreateDeviceResponse | null = null;
  showProvisionModal = false;
  newSerial = '';
  isProvisioning = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.adminService.getDevices(1, 100).subscribe({
      next: (res) => (this.devices = res),
      error: (err) => console.error('Failed to load admin devices', err)
    });
  }

  generateNewSerial(): void {
    this.generateNewSerialString();
    this.showProvisionModal = true;
    this.errorMessage = '';
  }

  generateNewSerialString(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newSerial = `FC-${code}`;
  }

  closeModal(): void {
    this.showProvisionModal = false;
    this.newSerial = '';
  }

  onProvisionSubmit(): void {
    if (!this.newSerial) return;

    this.isProvisioning = true;
    this.errorMessage = '';

    this.adminService.createDevice({ serialNumber: this.newSerial }).subscribe({
      next: (res) => {
        this.isProvisioning = false;
        this.latestProvisioned = res;
        this.closeModal();
        this.loadDevices();
      },
      error: (err) => {
        this.isProvisioning = false;
        this.errorMessage = err.message || 'Failed to provision device.';
      }
    });
  }

  onResetClaim(deviceId: string): void {
    this.adminService.resetClaim(deviceId).subscribe({
      next: (res) => {
        alert(`New claim code generated: ${res.newClaimCode}`);
        this.loadDevices();
      },
      error: (err) => alert(err.message || 'Failed to reset claim code.')
    });
  }

  onDisableDevice(deviceId: string): void {
    if (!confirm('Are you sure you want to disable this device? Hardware will be blocked from polling.')) return;

    this.adminService.disableDevice(deviceId).subscribe({
      next: () => this.loadDevices(),
      error: (err) => alert(err.message || 'Failed to disable device.')
    });
  }

  printLabel(): void {
    window.print();
  }
}
