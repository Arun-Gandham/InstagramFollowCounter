import { InstagramConnectionStatus } from './instagram.models';

export type DeviceStatus = 'Manufactured' | 'Unclaimed' | 'Active' | 'Disabled' | 'Revoked';

export interface LinkedInstagramAccount {
  id: string;
  username: string;
  followerCount?: number;
  connectionStatus: InstagramConnectionStatus;
}

export interface Device {
  id: string;
  serialNumber: string;
  nickname?: string;
  status: DeviceStatus;
  firmwareVersion?: string;
  digitCount?: number;
  lastSeenAt?: string;
  claimedAt?: string;
  createdAt: string;
  linkedInstagramAccount?: LinkedInstagramAccount;
}

export interface ClaimDeviceRequest {
  serialNumber: string;
  claimCode: string;
}

export interface ClaimDeviceResponse {
  deviceId: string;
  serialNumber: string;
  claimedAt: string;
}
