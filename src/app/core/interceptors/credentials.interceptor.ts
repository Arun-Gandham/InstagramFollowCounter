import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const configService = inject(ConfigService);
  let url = req.url;

  // If the request path is relative and starts with /api or /health, prepend the configured apiUrl
  if (url.startsWith('/api') || url.startsWith('/health')) {
    url = configService.getFullUrl(url);
  }

  const cloned = req.clone({
    url,
    withCredentials: true,
    setHeaders: {
      Accept: 'application/json'
    }
  });

  return next(cloned);
};
