import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized and not on /login or calling auth/me during initial probe
      if (error.status === 401 && !req.url.includes('/api/v1/auth/me') && !req.url.includes('/api/v1/auth/login')) {
        const currentUrl = router.url;
        if (!currentUrl.startsWith('/login')) {
          router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
        }
      }

      // Extract user-friendly error message from RFC 7807 ProblemDetails
      let friendlyMessage = 'An unexpected error occurred.';
      if (error.error) {
        if (typeof error.error === 'string') {
          friendlyMessage = error.error;
        } else if (error.error.detail) {
          friendlyMessage = error.error.detail;
        } else if (error.error.title) {
          friendlyMessage = error.error.title;
        } else if (error.error.errors && typeof error.error.errors === 'object') {
          const firstKey = Object.keys(error.error.errors)[0];
          if (firstKey && error.error.errors[firstKey].length > 0) {
            friendlyMessage = error.error.errors[firstKey][0];
          }
        }
      } else if (error.status === 0) {
        friendlyMessage = 'Unable to connect to the backend server. Please verify the API is running.';
      }

      return throwError(() => ({
        originalError: error,
        status: error.status,
        message: friendlyMessage
      }));
    })
  );
};
