import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(Router);
  const auth = inject(AuthService);

  const expectedRoles = (route.data?.['roles'] as string[]) ?? [];
  const user = auth.currentUser();

  if (!user) {
    authService.navigate(['/login']);
    return false;
  }

  // SuperAdmin has access to everything
  if (user.roles.includes('SuperAdmin')) {
    return true;
  }

  const hasRole = expectedRoles.some((role) => user.roles.includes(role));
  if (hasRole) {
    return true;
  }

  // Access denied -> redirect to dashboard
  authService.navigate(['/dashboard']);
  return false;
};
