import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  InstagramAccount,
  InstagramConnectResponse,
  RefreshFollowerResult
} from '../models/instagram.models';

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private readonly http = inject(HttpClient);

  /**
   * Generates the OAuth authorization URL for connecting Instagram
   */
  getConnectUrl(redirectAfterSuccess?: string): Observable<InstagramConnectResponse> {
    const params: Record<string, string> = {};
    if (redirectAfterSuccess) {
      params['redirectAfterSuccess'] = redirectAfterSuccess;
    }
    return this.http.get<InstagramConnectResponse>('/api/v1/instagram/connect', { params });
  }

  /**
   * Retrieves all Instagram accounts connected by the current user
   */
  getAccounts(): Observable<InstagramAccount[]> {
    return this.http.get<InstagramAccount[]>('/api/v1/instagram/accounts');
  }

  /**
   * Retrieves single Instagram account details
   */
  getAccountById(id: string): Observable<InstagramAccount> {
    return this.http.get<InstagramAccount>(`/api/v1/instagram/accounts/${id}`);
  }

  /**
   * Manually triggers an immediate follower refresh from Instagram
   */
  refreshFollowers(id: string): Observable<RefreshFollowerResult> {
    return this.http.post<RefreshFollowerResult>(`/api/v1/instagram/accounts/${id}/refresh`, {});
  }

  /**
   * Disconnects an Instagram account and revokes stored tokens
   */
  disconnectAccount(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/v1/instagram/accounts/${id}`);
  }
}
