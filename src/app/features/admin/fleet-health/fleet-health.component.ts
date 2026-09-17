import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminDevice,
  AdminInstagramConnection,
  AdminSystemHealth
} from '../../../core/models/admin.models';
import { DeviceStatus } from '../../../core/models/device.models';
import { AdminService } from '../../../core/services/admin.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-fleet-health',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './fleet-health.component.html',
  styleUrls: ['./fleet-health.component.css']
})
export class FleetHealthComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  health: AdminSystemHealth | null = null;
  devices: AdminDevice[] = [];
  filteredDevices: AdminDevice[] = [];
  connections: AdminInstagramConnection[] = [];
  filteredConnections: AdminInstagramConnection[] = [];

  activeTab: 'telemetry' | 'devices' | 'pipeline' = 'telemetry';
  isLoading = false;
  isSurging = false;

  deviceSearch = '';
  deviceStatusFilter: DeviceStatus | '' = '';
  connectionSearch = '';

  // Notification Toast State
  toastMessage: string | null = null;
  toastTitle = 'Notification';
  toastClass = 'alert-success';
  toastIcon = '✅';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.isLoading = true;
    this.loadHealth();
    this.loadDevices();
    this.loadConnections();
  }

  loadHealth(): void {
    this.adminService.getSystemHealth().subscribe({
      next: (res) => {
        this.health = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load fleet health', err);
        this.isLoading = false;
      }
    });
  }

  loadDevices(): void {
    this.adminService.getDevices(1, 100).subscribe({
      next: (res) => {
        this.devices = res.items || [];
        this.filterDevices();
      },
      error: (err) => console.error('Failed to load fleet devices', err)
    });
  }

  loadConnections(): void {
    this.adminService.getInstagramConnections(1, 100).subscribe({
      next: (res) => {
        this.connections = res || [];
        this.filterConnections();
      },
      error: (err) => console.error('Failed to load Instagram connections', err)
    });
  }

  filterDevices(): void {
    const q = this.deviceSearch.trim().toLowerCase();
    this.filteredDevices = this.devices.filter((d) => {
      const matchSearch =
        !q ||
        d.serialNumber.toLowerCase().includes(q) ||
        (d.ownerEmail && d.ownerEmail.toLowerCase().includes(q));
      const matchStatus = !this.deviceStatusFilter || d.status === this.deviceStatusFilter;
      return matchSearch && matchStatus;
    });
  }

  filterConnections(): void {
    const q = this.connectionSearch.trim().toLowerCase();
    this.filteredConnections = this.connections.filter((c) => {
      return (
        !q ||
        c.username.toLowerCase().includes(q) ||
        (c.ownerEmail && c.ownerEmail.toLowerCase().includes(q))
      );
    });
  }

  simulateFollowerSurge(delta = 100): void {
    this.isSurging = true;
    this.adminService.incrementFakeFollowers(delta).subscribe({
      next: (res) => {
        this.isSurging = false;
        this.showToast(
          'Follower Surge Simulated',
          `Follower count +${delta}. Live count: ${res.currentFollowerCount?.toLocaleString() || 'updated'}. Split-flap reels rotating!`,
          'success'
        );
        this.refreshAll();
      },
      error: (err) => {
        this.isSurging = false;
        this.showToast(
          'Simulation Notice',
          'Follower simulator is enabled in development mode.',
          'info'
        );
      }
    });
  }

  copyToClipboard(text: string, label: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copied', `${label} (${text}) copied to clipboard`, 'info');
      });
    }
  }

  onResetClaim(device: AdminDevice): void {
    if (confirm(`Generate new unboxing claim code for device ${device.serialNumber}?`)) {
      this.adminService.resetClaim(device.id).subscribe({
        next: (res) => {
          this.showToast(
            'Claim Code Reset',
            `Device ${device.serialNumber} new claim code: ${res.newClaimCode}`,
            'success'
          );
          this.loadDevices();
        },
        error: (err) => {
          this.showToast('Error', 'Failed to reset device claim code', 'danger');
        }
      });
    }
  }

  onDisableDevice(device: AdminDevice): void {
    if (confirm(`Disable hardware device ${device.serialNumber}? Device will be refused gateway access.`)) {
      this.adminService.disableDevice(device.id).subscribe({
        next: () => {
          this.showToast('Device Disabled', `Device ${device.serialNumber} has been disabled.`, 'info');
          this.loadDevices();
        },
        error: (err) => {
          this.showToast('Error', 'Failed to disable device', 'danger');
        }
      });
    }
  }

  showToast(title: string, message: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.toastTitle = title;
    this.toastMessage = message;

    if (type === 'success') {
      this.toastClass = 'alert-success';
      this.toastIcon = '✅';
    } else if (type === 'danger') {
      this.toastClass = 'alert-danger';
      this.toastIcon = '⚠️';
    } else {
      this.toastClass = 'alert-info';
      this.toastIcon = 'ℹ️';
    }

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.dismissToast();
    }, 4500);
  }

  dismissToast(): void {
    this.toastMessage = null;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }
}
