import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HealthCheckResult {
  reachable: boolean;
  status?: string;
  message?: string;
  serverTime?: string;
  details?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'ig_counter_backend_url';

  /**
   * Reactive signal holding the current Backend API base URL
   * e.g. "https://localhost:7149", "http://localhost:5033", or "" (relative/proxy)
   */
  readonly apiUrl = signal<string>(this.getInitialApiUrl());

  /**
   * Reads initial API URL from localStorage or environment fallback
   */
  private getInitialApiUrl(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored !== null && stored.trim().length > 0) {
        return stored.trim().replace(/\/+$/, '');
      }
    }
    return (environment.apiUrl ?? 'https://localhost:7149').replace(/\/+$/, '');
  }

  /**
   * Updates the Backend API URL at runtime and saves it to localStorage
   */
  setApiUrl(newUrl: string): void {
    const cleanUrl = (newUrl ?? '').trim().replace(/\/+$/, '');
    this.apiUrl.set(cleanUrl);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (cleanUrl) {
        localStorage.setItem(this.storageKey, cleanUrl);
      } else {
        localStorage.removeItem(this.storageKey);
      }
    }
  }

  /**
   * Resets the Backend API URL to the environment default
   */
  resetToDefault(): void {
    const defaultUrl = (environment.apiUrl ?? 'https://localhost:7149').replace(/\/+$/, '');
    this.setApiUrl(defaultUrl);
  }

  /**
   * Constructs the full absolute or relative URL for any path
   */
  getFullUrl(path: string): string {
    if (!path) return '';
    // If path is already an absolute URL (e.g. https://www.instagram.com/...), return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const base = this.apiUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!base) {
      return cleanPath;
    }
    return `${base}${cleanPath}`;
  }

  /**
   * Probes the backend API health endpoint to verify connectivity
   */
  testConnection(customBaseUrl?: string): Observable<HealthCheckResult> {
    const base = (customBaseUrl !== undefined ? customBaseUrl : this.apiUrl()).replace(/\/+$/, '');
    const pingUrl = `${base}/health/ready`;

    return this.http.get<any>(pingUrl, { headers: { 'Accept': 'application/json' } }).pipe(
      map((res) => ({
        reachable: true,
        status: res.status ?? 'Healthy',
        message: 'Connected successfully to backend API',
        serverTime: res.checks?.serverTime ?? res.timestamp ?? new Date().toISOString(),
        details: res.checks ?? res
      })),
      catchError((err) => {
        // Try fallback to /health/live if ready returned an error
        const liveUrl = `${base}/health/live`;
        return this.http.get<any>(liveUrl).pipe(
          map((res) => ({
            reachable: true,
            status: res.status ?? 'Live',
            message: 'Connected to backend (Live probe responding)',
            serverTime: res.timestamp ?? new Date().toISOString()
          })),
          catchError((liveErr) =>
            of({
              reachable: false,
              message: `Failed to connect to ${base}: ${liveErr.message || 'Server unreachable'}`
            })
          )
        );
      })
    );
  }
}
