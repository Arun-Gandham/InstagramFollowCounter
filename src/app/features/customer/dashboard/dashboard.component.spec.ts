import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Device } from '../../../core/models/device.models';
import { InstagramAccount } from '../../../core/models/instagram.models';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { DeviceService } from '../../../core/services/device.service';
import { InstagramService } from '../../../core/services/instagram.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockDevices: Device[] = [
    {
      id: 'dev-1',
      serialNumber: 'FC-A10001',
      nickname: 'Main Showroom',
      status: 'Active',
      firmwareVersion: 'FW v2.4.0',
      digitCount: 7,
      createdAt: '2026-01-01T00:00:00Z',
      linkedInstagramAccount: {
        id: 'acc-1',
        username: 'artisan_studio',
        followerCount: 24500,
        connectionStatus: 'Connected'
      }
    },
    {
      id: 'dev-2',
      serialNumber: 'FC-B20002',
      nickname: 'Atelier Window',
      status: 'Active',
      firmwareVersion: 'FW v2.4.0',
      digitCount: 5,
      createdAt: '2026-01-02T00:00:00Z'
    }
  ];

  const mockAccounts: InstagramAccount[] = [
    {
      id: 'acc-1',
      instagramUserId: 'ig-12345',
      username: 'artisan_studio',
      connectionStatus: 'Connected',
      followerCount: 24500,
      followerSequence: 12,
      lastFollowerRefreshAt: '2026-09-17T12:00:00Z',
      requiresReauthorization: false,
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  let mockDeviceService: jasmine.SpyObj<DeviceService>;
  let mockInstagramService: jasmine.SpyObj<InstagramService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    mockDeviceService = jasmine.createSpyObj('DeviceService', [
      'getDevices',
      'claimDevice',
      'bindInstagram',
      'unbindInstagram',
      'updateNickname'
    ]);
    mockInstagramService = jasmine.createSpyObj('InstagramService', [
      'getAccounts',
      'getConnectUrl',
      'refreshFollowers',
      'disconnectAccount'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'roles', 'currentUser']);
    mockConfigService = jasmine.createSpyObj('ConfigService', ['getFullUrl']);
    mockAdminService = jasmine.createSpyObj('AdminService', ['getSystemHealth']);

    mockDeviceService.getDevices.and.returnValue(of([
      { ...mockDevices[0] },
      { ...mockDevices[1] }
    ]));
    mockInstagramService.getAccounts.and.returnValue(of([
      { ...mockAccounts[0] }
    ]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DeviceService, useValue: mockDeviceService },
        { provide: InstagramService, useValue: mockInstagramService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AdminService, useValue: mockAdminService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { ig_connected: 'true' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dashboard component and load data', () => {
    expect(component).toBeTruthy();
    expect(mockDeviceService.getDevices).toHaveBeenCalled();
    expect(mockInstagramService.getAccounts).toHaveBeenCalled();
    expect(component.devices.length).toBe(2);
    expect(component.accounts.length).toBe(1);
    expect(component.successMessage).toContain('Instagram account successfully linked');
  });

  it('should automatically select the active linked device and account', () => {
    expect(component.selectedDevice).toBeTruthy();
    expect(component.selectedDevice?.id).toBe('dev-1');
    expect(component.activeAccount?.username).toBe('artisan_studio');
    expect(component.currentFollowerCount).toBe(24500);
    expect(component.activeDigitCount).toBe(7);
  });

  it('should switch selected device on onSelectDeviceById', () => {
    component.onSelectDeviceById('dev-2');
    expect(component.selectedDevice?.id).toBe('dev-2');
    expect(component.activeDigitCount).toBe(5);
    expect(component.activeAccount).toBeNull();
    expect(component.currentFollowerCount).toBe(0);
  });

  it('should open and close claim modal and fill demo credentials', () => {
    component.openClaimModal();
    expect(component.showClaimModal).toBeTrue();
    expect(component.claimErrorMessage).toBe('');

    component.fillTestClaim();
    expect(component.claimSerial).toBe('FC-A82F32');
    expect(component.claimCode).toBe('CLM-82F3-2ABC-9999');

    component.closeClaimModal();
    expect(component.showClaimModal).toBeFalse();
    expect(component.claimSerial).toBe('');
    expect(component.claimCode).toBe('');
  });

  it('should handle successful claim submission', () => {
    mockDeviceService.claimDevice.and.returnValue(
      of({
        deviceId: 'dev-new',
        serialNumber: 'FC-A82F32',
        claimedAt: new Date().toISOString()
      })
    );

    component.openClaimModal();
    component.fillTestClaim();
    component.onClaimSubmit();

    expect(mockDeviceService.claimDevice).toHaveBeenCalledWith({
      serialNumber: 'FC-A82F32',
      claimCode: 'CLM-82F3-2ABC-9999'
    });
    expect(component.showClaimModal).toBeFalse();
    expect(component.successMessage).toContain('successfully verified & registered');
  });

  it('should open, submit and close nickname modal', () => {
    mockDeviceService.updateNickname.and.returnValue(
      of({
        ...mockDevices[0],
        nickname: 'New Gallery Wall'
      })
    );

    component.openEditNicknameModal(mockDevices[0]);
    expect(component.showEditNicknameModal).toBeTrue();
    expect(component.editNicknameDeviceId).toBe('dev-1');
    expect(component.editNicknameValue).toBe('Main Showroom');

    component.editNicknameValue = 'New Gallery Wall';
    component.onNicknameSubmit();

    expect(mockDeviceService.updateNickname).toHaveBeenCalledWith('dev-1', 'New Gallery Wall');
    expect(component.showEditNicknameModal).toBeFalse();
    expect(component.successMessage).toContain('Counter nickname updated');
  });

  it('should handle refresh followers request', () => {
    mockInstagramService.refreshFollowers.and.returnValue(
      of({
        accountId: 'acc-1',
        username: 'artisan_studio',
        followerCount: 24520,
        changed: true,
        previousCount: 24500,
        sequence: 13,
        refreshedAt: new Date().toISOString()
      })
    );
    mockInstagramService.getAccounts.and.returnValue(of([
      {
        ...mockAccounts[0],
        followerCount: 24520,
        followerSequence: 13
      }
    ]));

    component.onRefreshFollowers('acc-1');
    expect(mockInstagramService.refreshFollowers).toHaveBeenCalledWith('acc-1');
    expect(component.currentFollowerCount).toBe(24520);
    expect(component.successMessage).toContain('Follower metrics updated from 24,500 to 24,520');
  });
});
