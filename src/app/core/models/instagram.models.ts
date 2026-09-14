export type InstagramConnectionStatus =
  | 'Connected'
  | 'TokenExpiring'
  | 'Refreshing'
  | 'Expired'
  | 'ReauthorizationRequired'
  | 'RateLimited'
  | 'TemporarilyUnavailable'
  | 'Disconnected'
  | 'Error';

export interface InstagramAccount {
  id: string;
  instagramUserId: string;
  username: string;
  accountType?: string;
  connectionStatus: InstagramConnectionStatus;
  followerCount?: number;
  followerSequence: number;
  lastFollowerRefreshAt?: string;
  requiresReauthorization: boolean;
  createdAt: string;
}

export interface InstagramConnectResponse {
  authorizationUrl: string;
}

export interface RefreshFollowerResult {
  accountId: string;
  username: string;
  followerCount: number;
  changed: boolean;
  previousCount: number;
  sequence: number;
  refreshedAt: string;
}
