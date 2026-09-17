import { DeviceStatus } from './device.models';
import { InstagramConnectionStatus } from './instagram.models';

export interface CreateDeviceRequest {
  serialNumber: string;
  digitCount?: number;
}

export interface CreateDeviceResponse {
  deviceId: string;
  serialNumber: string;
  digitCount: number;
  plaintextDeviceSecret: string;
  plaintextClaimCode: string;
  claimExpiresAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  emailConfirmed: boolean;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  deviceCount: number;
  instagramAccountCount: number;
}

export interface AdminDevice {
  id: string;
  serialNumber: string;
  digitCount: number;
  status: DeviceStatus;
  firmwareVersion?: string;
  ownerUserId?: string;
  ownerEmail?: string;
  createdAt: string;
  claimedAt?: string;
  lastSeenAt?: string;
}

export interface AdminInstagramConnection {
  id: string;
  instagramUserId: string;
  username: string;
  accountType?: string;
  ownerUserId: string;
  ownerEmail: string;
  connectionStatus: InstagramConnectionStatus;
  requiresReauthorization: boolean;
  followerCount?: number;
  followerSequence: number;
  lastFollowerRefreshAt?: string;
  nextRefreshAttemptAt?: string;
  tokenRefreshFailureCount: number;
  lastApiErrorCode?: string;
  lastApiErrorAt?: string;
}

export interface AdminSystemHealth {
  status: string;
  totalUsers: number;
  totalActiveDevices: number;
  totalConnectedInstagramAccounts: number;
  accountsRequiringReauth: number;
  rateLimitedAccounts: number;
  serverTime: string;
}

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
