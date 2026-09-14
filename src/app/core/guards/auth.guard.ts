import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoading()) {
    if (authService.isAuthenticated()) {
      return true;
    }
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // If still loading session on boot, wait for restoreSession
  return authService.restoreSession().pipe(
    map((user) => {
      if (user) {
        return true;
      }
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
