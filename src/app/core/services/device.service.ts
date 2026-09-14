import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClaimDeviceRequest, ClaimDeviceResponse, Device } from '../models/device.models';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly http = inject(HttpClient);

  /**
   * Retrieves all devices claimed by the current user
   */
  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>('/api/v1/devices');
  }

  /**
   * Claims a physical counter using Serial Number and Claim Code
   */
  claimDevice(request: ClaimDeviceRequest): Observable<ClaimDeviceResponse> {
    return this.http.post<ClaimDeviceResponse>('/api/v1/devices/claim', request);
  }

  /**
   * Binds a claimed counter to an Instagram account
   */
  bindInstagram(deviceId: string, instagramAccountId: string): Observable<void> {
    return this.http.post<void>(`/api/v1/devices/${deviceId}/instagram/${instagramAccountId}`, {});
  }

  /**
   * Unbinds a counter from its current Instagram account
   */
  unbindInstagram(deviceId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/devices/${deviceId}/instagram`);
  }
}
