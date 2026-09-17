import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Device } from '../../../core/models/device.models';
import { InstagramAccount } from '../../../core/models/instagram.models';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { DeviceService } from '../../../core/services/device.service';
import { InstagramService } from '../../../core/services/instagram.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FollowerCounterComponent } from './components/follower-counter/follower-counter.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FollowerCounterComponent,
    StatusBadgeComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
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
  isLoading = true;

  // Claim Modal State
  showClaimModal = false;
  claimSerial = '';
  claimCode = '';
  isClaiming = false;
  claimErrorMessage = '';

  // Toast Alerts State
  private _successMessage = '';
  private _errorMessage = '';
  isSuccessToastClosing = false;
  isErrorToastClosing = false;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  get successMessage(): string {
    return this._successMessage;
  }
  set successMessage(val: string) {
    if (val) {
      this.isSuccessToastClosing = false;
      this._successMessage = val;
      this.startToastTimer('success');
    } else {
      this.closeSuccessToast();
    }
  }

  get errorMessage(): string {
    return this._errorMessage;
  }
  set errorMessage(val: string) {
    if (val) {
      this.isErrorToastClosing = false;
      this._errorMessage = val;
      this.startToastTimer('error');
    } else {
      this.closeErrorToast();
    }
  }

  // Edit Nickname Modal State
  showEditNicknameModal = false;
  editNicknameDeviceId = '';
  editNicknameValue = '';
  isSavingNickname = false;

  // Bind Confirm Modal State
  showBindConfirmModal = false;
  bindConfirmMessage = '';
  pendingBindDevice: Device | null = null;
  pendingBindAccountId = '';
  pendingBindSelect: HTMLSelectElement | null = null;

  ngOnInit(): void {
    this.loadData();

    if (this.route.snapshot.queryParams['ig_connected']) {
      this.successMessage = 'Instagram account successfully linked and verified!';
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }

  private startToastTimer(type: 'success' | 'error'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      if (type === 'success') this.closeSuccessToast();
      if (type === 'error') this.closeErrorToast();
    }, 4500);
  }

  closeSuccessToast(): void {
    if (!this._successMessage) return;
    this.isSuccessToastClosing = true;
    setTimeout(() => {
      this._successMessage = '';
      this.isSuccessToastClosing = false;
    }, 380);
  }

  closeErrorToast(): void {
    if (!this._errorMessage) return;
    this.isErrorToastClosing = true;
    setTimeout(() => {
      this._errorMessage = '';
      this.isErrorToastClosing = false;
    }, 380);
  }

  get activeLinkedDevices(): Device[] {
    return this.devices.filter(
      (d) => d.status === 'Active' && !!d.linkedInstagramAccount
    );
  }

  get isInstagramConnected(): boolean {
    return this.accounts.length > 0;
  }

  get isHardwareOnline(): boolean {
    return !!this.selectedDevice && this.selectedDevice.status === 'Active';
  }

  loadData(): void {
    this.isLoading = true;

    this.deviceService.getDevices().subscribe({
      next: (devices) => {
        this.devices = devices;
        this.updateActiveDisplay();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load devices', err);
      }
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

  onSelectDeviceById(deviceId: string): void {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (dev) {
      this.selectDevice(dev);
    }
  }

  private updateActiveDisplay(): void {
    if (this.selectedDevice) {
      const current = this.devices.find((d) => d.id === this.selectedDevice!.id);
      if (current) {
        this.selectDevice(current);
        return;
      }
    }

    if (this.devices.length > 0) {
      const firstLinked = this.activeLinkedDevices[0];
      this.selectDevice(firstLinked || this.devices[0]);
    } else {
      this.selectedDevice = null;
      this.activeAccount = null;
      this.currentFollowerCount = 0;
    }
  }

  onRefreshFollowers(accountId?: string): void {
    const targetAccountId = accountId || this.activeAccount?.id;
    if (!targetAccountId) return;

    this.isRefreshing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.instagramService.refreshFollowers(targetAccountId).subscribe({
      next: (res) => {
        this.isRefreshing = false;
        this.currentFollowerCount = res.followerCount;
        if (this.activeAccount && this.activeAccount.id === targetAccountId) {
          this.activeAccount.followerCount = res.followerCount;
          this.activeAccount.followerSequence = res.sequence;
          this.activeAccount.lastFollowerRefreshAt = res.refreshedAt;
        }
        this.successMessage = res.changed
          ? `Follower metrics updated from ${res.previousCount.toLocaleString()} to ${res.followerCount.toLocaleString()}!`
          : `Followers synchronized. Count is steady at ${res.followerCount.toLocaleString()}.`;
        this.loadData();
      },
      error: (err) => {
        this.isRefreshing = false;
        this.errorMessage = err.message || 'Synchronization request failed. Please check network connection.';
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
        this.errorMessage = err.message || 'Unable to start Instagram OAuth connection. Verify user session.';
      }
    });
  }

  onDisconnectAccount(accountId: string): void {
    if (!confirm('Are you sure you want to disconnect this Instagram profile? This will unlink active hardware feeds.')) return;

    this.instagramService.disconnectAccount(accountId).subscribe({
      next: () => {
        this.successMessage = 'Instagram profile disconnected and authorization revoked.';
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to disconnect account.';
      }
    });
  }

  onBindDevice(device: Device, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const instagramAccountId = select.value;
    const isDisconnect = !instagramAccountId;

    this.pendingBindDevice = device;
    this.pendingBindAccountId = instagramAccountId;
    this.pendingBindSelect = select;

    const actionText = isDisconnect
      ? 'disconnect the live Instagram feed from this physical unit'
      : 're-route this physical unit to the selected Instagram account';
    this.bindConfirmMessage = `Confirm feed reassignment: Are you sure you want to ${actionText}?`;
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
          this.successMessage = 'Counter unit detached from Instagram feed.';
          this.loadData();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to unbind counter unit.';
          select.value = device.linkedInstagramAccount?.id ?? '';
        }
      });
      return;
    }

    this.deviceService.bindInstagram(device.id, instagramAccountId).subscribe({
      next: () => {
        this.successMessage = 'Physical counter successfully bound to Instagram profile!';
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to bind counter unit.';
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
    this.claimErrorMessage = '';
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
      serialNumber: this.claimSerial.trim().toUpperCase(),
      claimCode: this.claimCode.trim()
    }).subscribe({
      next: (res) => {
        this.isClaiming = false;
        this.closeClaimModal();
        this.successMessage = `Hardware counter ${res.serialNumber} successfully verified & registered!`;
        this.loadData();
      },
      error: (err) => {
        this.isClaiming = false;
        this.claimErrorMessage = err.message || 'Verification failed. Please verify the serial number and claim code.';
      }
    });
  }

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
    this.deviceService.updateNickname(this.editNicknameDeviceId, this.editNicknameValue.trim() || null).subscribe({
      next: () => {
        this.isSavingNickname = false;
        this.closeEditNicknameModal();
        this.successMessage = 'Counter nickname updated.';
        this.loadData();
      },
      error: (err) => {
        this.isSavingNickname = false;
        this.errorMessage = err.message || 'Failed to update nickname.';
      }
    });
  }
}
