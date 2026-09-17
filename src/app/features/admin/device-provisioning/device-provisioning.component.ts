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
              Issue cryptographic hardware credentials, configure 5/7 digit mechanical drums, and generate packaging unboxing claim cards
            </p>
          </div>

          <button (click)="generateNewSerial()" class="btn btn-primary flex items-center gap-2">
            <span>+ Provision New Unit</span>
          </button>
        </div>

        <!-- Generated Device Packaging Card (Print Ready) -->
        @if (latestProvisioned) {
          <div class="card label-print-card mb-6 animate-fade-in">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-subtle flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="badge badge-success">READY FOR PACKAGING</span>
                <span class="badge badge-neutral font-mono">{{ latestProvisioned.digitCount }}-DIGIT REEL</span>
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
                  <span class="label-brand">FOLLOWER COUNTER • MODEL FC-0{{ latestProvisioned.digitCount }} MECHANICAL</span>
                  <div class="text-xs text-muted mt-0.5">AUTHENTIC ELECTRO-MECHANICAL PRODUCT CERTIFICATE • {{ latestProvisioned.digitCount }}-DIGIT DRUM</div>
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
                  <p class="text-xs text-muted">Select drum size and generate cryptographic keys</p>
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
                  <!-- Drum Hardware Specification Selector -->
                  <div class="form-group mb-4">
                    <label class="form-label">Hardware Drum Specification</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        (click)="selectedDigitCount = 5"
                        class="drum-select-card"
                        [class.selected]="selectedDigitCount === 5"
                      >
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-sm">5 Digits</span>
                          <span class="badge badge-neutral font-mono">FC-05</span>
                        </div>
                        <p class="text-xs text-muted mt-1">Compact desk unit • Up to 99,999 followers</p>
                      </button>

                      <button
                        type="button"
                        (click)="selectedDigitCount = 7"
                        class="drum-select-card"
                        [class.selected]="selectedDigitCount === 7"
                      >
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-sm">7 Digits</span>
                          <span class="badge badge-neutral font-mono">FC-07</span>
                        </div>
                        <p class="text-xs text-muted mt-1">Pro showroom unit • Up to 9,999,999 followers</p>
                      </button>
                    </div>
                  </div>

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
                        <span>Issue FC-0{{ selectedDigitCount }} Credentials</span>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        }

        <!-- Edit Modal -->
        @if (showEditModal) {
          <div class="modal-backdrop" (click)="closeEditModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header flex items-center justify-between p-6 border-b border-subtle">
                <div>
                  <h3 class="text-base font-bold text-heading">Edit Hardware Configuration</h3>
                  <p class="text-xs text-muted">Update drum size or serial number</p>
                </div>
                <button (click)="closeEditModal()" class="btn-close">✕</button>
              </div>

              <div class="p-6">
                @if (editErrorMessage) {
                  <div class="alert alert-danger mb-4 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                    </svg>
                    <span>{{ editErrorMessage }}</span>
                  </div>
                }

                <form (ngSubmit)="onEditSubmit()">
                  <div class="form-group mb-4">
                    <label class="form-label">Hardware Drum Specification</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        (click)="editDigitCount = 5"
                        class="drum-select-card"
                        [class.selected]="editDigitCount === 5"
                      >
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-sm">5 Digits</span>
                          <span class="badge badge-neutral font-mono">FC-05</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        (click)="editDigitCount = 7"
                        class="drum-select-card"
                        [class.selected]="editDigitCount === 7"
                      >
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-sm">7 Digits</span>
                          <span class="badge badge-neutral font-mono">FC-07</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div class="form-group mb-6">
                    <label class="form-label" for="editSerial">Serial Number</label>
                    <input
                      type="text"
                      id="editSerial"
                      name="editSerial"
                      [(ngModel)]="editSerial"
                      required
                      class="form-control font-mono tracking-wider text-sm w-full"
                    />
                  </div>

                  <div class="modal-actions flex items-center justify-between pt-4 border-t border-subtle">
                    <button type="button" (click)="closeEditModal()" class="btn btn-secondary btn-sm">Cancel</button>
                    <button
                      type="submit"
                      [disabled]="!editSerial || isEditing"
                      class="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      @if (isEditing) {
                        <span>Saving...</span>
                      } @else {
                        <span>Save Changes</span>
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
            <div class="flex items-center gap-2">
              <button (click)="seedFactory()" class="btn btn-secondary btn-xs mr-2">Generate Test Data</button>
              <button (click)="loadDevices()" class="btn btn-secondary btn-xs">Refresh Inventory</button>
            </div>
          </div>

          <div class="flex items-center gap-4 mb-4">
            <div class="flex-grow">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="onFilterChange()"
                placeholder="Search by ID, Serial, Email..." 
                class="form-control text-sm w-full"
              >
            </div>
            <div>
              <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="form-control text-sm">
                <option value="">All Statuses</option>
                <option value="Unclaimed">Unclaimed</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <div>
              <button (click)="onFilterChange()" class="btn btn-primary btn-sm">Search</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Drum Model</th>
                  <th>Hardware Status</th>
                  <th>Firmware</th>
                  <th>Assigned Customer</th>
                  <th>Manufactured Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (device of devices; track device.id) {
                  <tr>
                    <td class="font-mono font-bold text-heading">{{ device.serialNumber }}</td>
                    <td>
                      <span class="badge badge-neutral font-mono font-bold">
                        FC-0{{ device.digitCount || 7 }} ({{ device.digitCount || 7 }} Digits)
                      </span>
                    </td>
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
                    <td>
                      <div class="flex gap-2">
                        <button
                          (click)="openEditModal(device)"
                          class="btn btn-secondary btn-xs"
                          title="Edit device configuration"
                        >
                          Edit
                        </button>
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

          <div class="flex items-center justify-between mt-4">
            <span class="text-xs text-muted">Showing {{ devices.length }} of {{ totalCount }}</span>
            <div class="flex items-center gap-2">
              <button 
                class="btn btn-secondary btn-xs" 
                [disabled]="currentPage === 1" 
                (click)="onPageChange(currentPage - 1)">
                Previous
              </button>
              <span class="text-xs font-mono">Page {{ currentPage }} of {{ totalPages }}</span>
              <button 
                class="btn btn-secondary btn-xs" 
                [disabled]="currentPage === totalPages || totalPages === 0" 
                (click)="onPageChange(currentPage + 1)">
                Next
              </button>
            </div>
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
    .drum-select-card {
      background: #ffffff;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.85rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .drum-select-card:hover {
      border-color: #94a3b8;
    }
    .drum-select-card.selected {
      border-color: #0f172a;
      background: #f8fafc;
      box-shadow: 0 0 0 1px #0f172a;
    }
    .drum-pill {
      border: none;
      background: transparent;
      padding: 1px 6px;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      border-radius: 3px;
    }
    .drum-pill:hover {
      color: #0f172a;
    }
    .drum-pill.active {
      background: #0f172a;
      color: #ffffff;
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
  selectedDigitCount = 7;
  isProvisioning = false;
  errorMessage = '';

  // Pagination & Filters
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  searchQuery = '';
  statusFilter: any = '';

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.adminService.getDevices(this.currentPage, this.pageSize, this.searchQuery, this.statusFilter).subscribe({
      next: (res: any) => {
        // If API returns PagedResult
        if (res.items) {
          this.devices = res.items;
          this.totalCount = res.totalCount;
        } else {
          // Fallback if API hasn't restarted yet
          this.devices = res;
          this.totalCount = res.length;
        }
      },
      error: (err) => console.error('Failed to load admin devices', err)
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDevices();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadDevices();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  seedFactory(): void {
    if (!confirm('This will generate 100 random devices. Proceed?')) return;
    this.adminService['http'].post('/api/v1/admin/devices/factory-seed?count=100', {}).subscribe({
      next: () => {
        alert('Factory devices generated!');
        this.loadDevices();
      },
      error: (err: any) => alert('Factory generation failed: ' + err.message)
    });
  }

  getDeviceDigits(serial: string): number {
    const stored = localStorage.getItem('device_digits_' + serial);
    return stored ? parseInt(stored, 10) : 7;
  }

  setDeviceDigits(serial: string, digits: number): void {
    localStorage.setItem('device_digits_' + serial, digits.toString());
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

    this.adminService.createDevice({
      serialNumber: this.newSerial,
      digitCount: this.selectedDigitCount
    }).subscribe({
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

  // Edit State
  showEditModal = false;
  editDeviceId = '';
  editSerial = '';
  editDigitCount = 7;
  isEditing = false;
  editErrorMessage = '';

  openEditModal(device: AdminDevice): void {
    this.editDeviceId = device.id;
    this.editSerial = device.serialNumber;
    this.editDigitCount = device.digitCount || 7;
    this.showEditModal = true;
    this.editErrorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editDeviceId = '';
    this.editSerial = '';
  }

  onEditSubmit(): void {
    if (!this.editSerial || !this.editDeviceId) return;

    this.isEditing = true;
    this.editErrorMessage = '';

    this.adminService.updateDevice(this.editDeviceId, {
      serialNumber: this.editSerial,
      digitCount: this.editDigitCount
    }).subscribe({
      next: () => {
        this.isEditing = false;
        this.closeEditModal();
        this.loadDevices();
      },
      error: (err) => {
        this.isEditing = false;
        this.editErrorMessage = err.message || 'Failed to update device.';
      }
    });
  }

  printLabel(): void {
    window.print();
  }
}
