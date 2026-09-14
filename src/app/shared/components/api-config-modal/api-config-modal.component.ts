import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigService, HealthCheckResult } from '../../../core/services/config.service';

@Component({
  selector: 'app-api-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="header-icon-box">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3>Backend Connection Gateway</h3>
              <p class="modal-subtitle">Switch API runtime endpoints without rebuilding frontend</p>
            </div>
          </div>
          <button (click)="close()" class="btn-close" title="Close dialog">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="customUrl">API Server Base URL</label>
            <input
              type="text"
              id="customUrl"
              [(ngModel)]="apiUrlInput"
              class="form-control font-mono"
              placeholder="https://localhost:7149"
            />
            <span class="text-xs text-muted mt-2 block">
              Leave blank for relative proxy routing. Direct cross-origin requires backend CORS allowance.
            </span>
          </div>

          <!-- Quick Select Presets -->
          <div class="preset-box mb-4">
            <span class="preset-label">FAST PRESET SELECTOR:</span>
            <div class="flex gap-2 mt-2 flex-wrap">
              <button
                type="button"
                (click)="setPreset('https://localhost:7149')"
                class="btn btn-secondary btn-xs"
                [class.is-active]="apiUrlInput === 'https://localhost:7149'"
              >
                🔒 HTTPS (7149)
              </button>
              <button
                type="button"
                (click)="setPreset('http://localhost:5033')"
                class="btn btn-secondary btn-xs"
                [class.is-active]="apiUrlInput === 'http://localhost:5033'"
              >
                ⚡ HTTP (5033)
              </button>
              <button
                type="button"
                (click)="setPreset('')"
                class="btn btn-secondary btn-xs"
                [class.is-active]="apiUrlInput === ''"
              >
                🔄 Relative Proxy
              </button>
            </div>
          </div>

          <!-- Test Connection Result -->
          @if (testResult) {
            <div
              class="alert mb-4"
              [ngClass]="testResult.reachable ? 'alert-success' : 'alert-danger'"
            >
              <div class="w-full">
                <div class="flex items-center justify-between">
                  <span class="font-bold">
                    {{ testResult.reachable ? 'API Reachable & Verified' : 'Connection Failed' }}
                  </span>
                  @if (testResult.reachable) {
                    <span class="badge badge-success">ONLINE</span>
                  }
                </div>
                <div class="text-xs mt-1">{{ testResult.message }}</div>
                @if (testResult.serverTime) {
                  <div class="text-xs font-mono mt-1 opacity-80">Server UTC: {{ testResult.serverTime | date:'medium' }}</div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer flex items-center justify-between">
          <button
            type="button"
            (click)="testCurrentUrl()"
            [disabled]="isTesting"
            class="btn btn-outline btn-sm"
          >
            @if (isTesting) {
              <span>Testing Probe...</span>
            } @else {
              <span>🔍 Test Health Probe</span>
            }
          </button>

          <div class="flex items-center gap-2">
            <button type="button" (click)="resetDefault()" class="btn btn-secondary btn-sm">
              Reset Default
            </button>
            <button type="button" (click)="saveAndApply()" class="btn btn-primary btn-sm">
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      background: #ffffff;
    }
    .header-icon-box {
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
    .header-icon-box svg {
      width: 18px;
      height: 18px;
    }
    .modal-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .btn-close {
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      background: transparent;
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .btn-close svg {
      width: 15px;
      height: 15px;
    }
    .modal-body {
      padding: 1.5rem;
      background: #ffffff;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-subtle);
      background: #f8fafc;
    }
    .preset-box {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
    }
    .preset-label {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .btn-secondary.is-active {
      background: #0f172a;
      border-color: #0f172a;
      color: #ffffff;
    }
    .block { display: block; }
    .flex-wrap { flex-wrap: wrap; }
    .opacity-80 { opacity: 0.8; }
  `]
})
export class ApiConfigModalComponent implements OnInit {
  private readonly configService = inject(ConfigService);

  @Input() isOpen = false;
  @Output() closeRequested = new EventEmitter<void>();

  apiUrlInput = '';
  isTesting = false;
  testResult: HealthCheckResult | null = null;

  ngOnInit(): void {
    this.apiUrlInput = this.configService.apiUrl();
  }

  setPreset(url: string): void {
    this.apiUrlInput = url;
    this.testResult = null;
  }

  testCurrentUrl(): void {
    this.isTesting = true;
    this.testResult = null;
    this.configService.testConnection(this.apiUrlInput).subscribe({
      next: (res) => {
        this.isTesting = false;
        this.testResult = res;
      },
      error: (err) => {
        this.isTesting = false;
        this.testResult = {
          reachable: false,
          message: err.message || 'Connection test failed'
        };
      }
    });
  }

  saveAndApply(): void {
    this.configService.setApiUrl(this.apiUrlInput);
    this.close();
  }

  resetDefault(): void {
    this.configService.resetToDefault();
    this.apiUrlInput = this.configService.apiUrl();
    this.testResult = null;
  }

  close(): void {
    this.testResult = null;
    this.closeRequested.emit();
  }
}
