import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const publicOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoading()) {
    if (authService.isAuthenticated()) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  return authService.restoreSession().pipe(
    map((user) => {
      if (user) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
