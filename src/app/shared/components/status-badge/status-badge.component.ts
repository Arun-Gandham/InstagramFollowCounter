import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DeviceStatus } from '../../../core/models/device.models';
import { InstagramConnectionStatus } from '../../../core/models/instagram.models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <span class="badge-dot"></span>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status?: DeviceStatus | InstagramConnectionStatus | string;

  get label(): string {
    return this.status ?? 'Unknown';
  }

  get badgeClass(): string {
    switch (this.status) {
      case 'Active':
      case 'Connected':
        return 'badge-success';
      case 'Unclaimed':
      case 'TokenExpiring':
      case 'Refreshing':
        return 'badge-warning';
      case 'Disabled':
      case 'Revoked':
      case 'Expired':
      case 'ReauthorizationRequired':
      case 'Error':
        return 'badge-danger';
      case 'Manufactured':
      case 'RateLimited':
      case 'TemporarilyUnavailable':
      default:
        return 'badge-info';
    }
  }
}
