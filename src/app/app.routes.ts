import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicOnlyGuard } from './core/guards/public-only.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./public/product-page/product-page.component').then((m) => m.ProductPageComponent)
  },
  {
    path: 'login',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      )
  },
  {
    path: 'forgot-password',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      )
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/customer/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      )
  },
  {
    path: 'admin/provisioning',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'SuperAdmin'] },
    loadComponent: () =>
      import('./features/admin/device-provisioning/device-provisioning.component').then(
        (m) => m.DeviceProvisioningComponent
      )
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'SuperAdmin'] },
    loadComponent: () =>
      import('./features/admin/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      )
  },
  {
    path: 'admin/overview',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'SuperAdmin'] },
    loadComponent: () =>
      import('./features/admin/fleet-health/fleet-health.component').then(
        (m) => m.FleetHealthComponent
      )
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
