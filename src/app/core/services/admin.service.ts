import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminDevice,
  AdminInstagramConnection,
  AdminSystemHealth,
  AdminUser,
  CreateDeviceRequest,
  CreateDeviceResponse
} from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);

  getUsers(page = 1, pageSize = 50): Observable<AdminUser[]> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<AdminUser[]>('/api/v1/admin/users', { params });
  }

  getDevices(page = 1, pageSize = 50): Observable<AdminDevice[]> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<AdminDevice[]>('/api/v1/admin/devices', { params });
  }

  createDevice(request: CreateDeviceRequest): Observable<CreateDeviceResponse> {
    return this.http.post<CreateDeviceResponse>('/api/v1/admin/devices', request);
  }

  disableDevice(deviceId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/v1/admin/devices/${deviceId}/disable`, {});
  }

  resetClaim(deviceId: string): Observable<{ message: string; newClaimCode: string }> {
    return this.http.post<{ message: string; newClaimCode: string }>(`/api/v1/admin/devices/${deviceId}/reset-claim`, {});
  }

  getInstagramConnections(page = 1, pageSize = 50): Observable<AdminInstagramConnection[]> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<AdminInstagramConnection[]>('/api/v1/admin/instagram-connections', { params });
  }

  getSystemHealth(): Observable<AdminSystemHealth> {
    return this.http.get<AdminSystemHealth>('/api/v1/admin/system-health');
  }

  incrementFakeFollowers(delta = 1): Observable<{ message: string; currentFollowerCount: number }> {
    const params = new HttpParams().set('delta', delta);
    return this.http.post<{ message: string; currentFollowerCount: number }>('/api/v1/admin/fake-instagram/increment', {}, { params });
  }
}
