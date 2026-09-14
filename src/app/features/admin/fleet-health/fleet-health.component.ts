import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdminSystemHealth } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-fleet-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-page">
      <div class="container">
        <!-- Header -->
        <div class="header-bar flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-success">SYSTEM HEALTHY</span>
              <span class="text-xs text-muted">FLEET TELEMETRY & WORKERS</span>
            </div>
            <h1 class="text-2xl font-extrabold text-heading">Hardware Fleet & System Health</h1>
            <p class="subtitle text-sm text-muted mt-1">
              Live operational monitoring for electro-mechanical hardware, Meta OAuth tokens, and workers
            </p>
          </div>
          <button (click)="loadHealth()" class="btn btn-secondary btn-sm flex items-center gap-1.5">
            <span>🔄</span>
            <span>Refresh Telemetry</span>
          </button>
        </div>

        @if (health) {
          <!-- KPI Metrics Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <div class="card metric-card">
              <span class="metric-title">SYSTEM STATUS</span>
              <div class="flex items-center gap-2.5 mt-3">
                <span class="status-dot-large" [class.is-healthy]="health.status === 'Healthy'"></span>
                <span class="metric-big">{{ health.status }}</span>
              </div>
              <span class="metric-desc">Database & Background Jobs Active</span>
            </div>

            <div class="card metric-card">
              <span class="metric-title">ACTIVE COUNTERS</span>
              <div class="metric-big font-mono mt-3">{{ health.totalActiveDevices }}</div>
              <span class="metric-desc">Hardware units polling live API</span>
            </div>

            <div class="card metric-card">
              <span class="metric-title">CONNECTED CREATORS</span>
              <div class="metric-big font-mono mt-3">{{ health.totalConnectedInstagramAccounts }}</div>
              <span class="metric-desc">Authenticated Graph API feeds</span>
            </div>

            <div class="card metric-card">
              <span class="metric-title">TOKEN REAUTHORIZATIONS</span>
              <div class="metric-big font-mono mt-3" [class.text-danger]="health.accountsRequiringReauth > 0">
                {{ health.accountsRequiringReauth }}
              </div>
              <span class="metric-desc">Accounts requiring OAuth refresh</span>
            </div>
          </div>

          <!-- Diagnostic Server Box -->
          <div class="card">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 class="text-base font-bold text-heading">Backend Gateway Diagnostics</h3>
                <p class="text-xs text-muted">Server heartbeat and database synchronization</p>
              </div>
              <div class="font-mono text-xs text-muted bg-surface-subtle px-3 py-1.5 rounded border border-subtle">
                Server UTC: {{ health.serverTime | date:'medium' }}
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .health-page {
      padding-top: 2rem;
      padding-bottom: 4rem;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-canvas);
    }
    .metric-card {
      background: #ffffff;
    }
    .metric-title {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
    }
    .metric-big {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }
    .metric-desc {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.5rem;
    }
    .status-dot-large {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #f59e0b;
    }
    .status-dot-large.is-healthy {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .border-subtle {
      border-color: var(--border-subtle);
    }
  `]
})
export class FleetHealthComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  health: AdminSystemHealth | null = null;

  ngOnInit(): void {
    this.loadHealth();
  }

  loadHealth(): void {
    this.adminService.getSystemHealth().subscribe({
      next: (res) => (this.health = res),
      error: (err) => console.error('Failed to load fleet health', err)
    });
  }
}
