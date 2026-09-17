import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-follower-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './follower-counter.component.html',
  styleUrls: ['./follower-counter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowerCounterComponent implements OnChanges, OnDestroy {
  @Input() count: number | null | undefined = 0;
  @Input() digitCount = 7;
  @Input() username: string | null | undefined = null;
  @Input() deviceStatus: string | null | undefined = 'Active';
  @Input() connectionStatus: string | null | undefined = 'Connected';
  @Input() lastSyncTime: string | null | undefined = null;
  @Input() isRefreshing = false;
  @Input() deviceSerialNumber: string | null | undefined = null;
  @Input() deviceNickname: string | null | undefined = null;

  @Output() refresh = new EventEmitter<void>();

  digits: string[] = [];
  flippingIndices = new Set<number>();

  private previousDigits: string[] = [];
  private animationTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['count'] || changes['digitCount']) {
      this.updateFlapDigits();
    }
  }

  ngOnDestroy(): void {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
  }

  onTriggerRefresh(): void {
    if (!this.isRefreshing) {
      this.refresh.emit();
    }
  }

  get isOperational(): boolean {
    const isDevActive = !this.deviceStatus || this.deviceStatus === 'Active';
    const isConnActive = !this.connectionStatus || this.connectionStatus === 'Connected';
    return isDevActive && isConnActive;
  }

  get isStale(): boolean {
    return this.connectionStatus === 'TokenExpiring' || this.connectionStatus === 'Refreshing';
  }

  get isOffline(): boolean {
    return (
      this.deviceStatus === 'Disabled' ||
      this.deviceStatus === 'Revoked' ||
      this.connectionStatus === 'Disconnected' ||
      this.connectionStatus === 'Error' ||
      this.connectionStatus === 'Expired' ||
      this.connectionStatus === 'ReauthorizationRequired'
    );
  }

  get modelCode(): string {
    const drums = this.digitCount === 5 ? '05' : '07';
    return `MOD. MEC-${drums}`;
  }

  get displayLabel(): string {
    if (this.deviceNickname) {
      return this.deviceNickname;
    }
    if (this.deviceSerialNumber) {
      return `UNIT ${this.deviceSerialNumber}`;
    }
    return 'SHOWROOM CONSOLE';
  }

  get formattedLastSync(): string {
    if (!this.lastSyncTime) {
      return 'Just now';
    }
    try {
      const date = new Date(this.lastSyncTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return this.lastSyncTime;
    }
  }

  private updateFlapDigits(): void {
    const rawVal = Math.max(0, Math.floor(this.count ?? 0));
    const padded = rawVal.toString().padStart(this.digitCount, '0').slice(-this.digitCount);
    const newDigits = padded.split('');

    this.flippingIndices.clear();

    if (this.previousDigits.length === newDigits.length) {
      newDigits.forEach((digit, idx) => {
        if (digit !== this.previousDigits[idx]) {
          this.flippingIndices.add(idx);
        }
      });
    }

    this.digits = newDigits;
    this.previousDigits = [...newDigits];

    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }

    if (this.flippingIndices.size > 0) {
      this.animationTimeout = setTimeout(() => {
        this.flippingIndices.clear();
      }, 360);
    }
  }
}
