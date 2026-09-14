import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUser } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-page">
      <div class="container">
        <!-- Header -->
        <div class="header-bar flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-neutral">PLATFORM REGISTRY</span>
              <span class="text-xs text-muted">IDENTITY & HARDWARE MAP</span>
            </div>
            <h1 class="text-2xl font-extrabold text-heading">User & Creator Directory</h1>
            <p class="subtitle text-sm text-muted mt-1">
              Platform customers, claimed hardware displays, and linked Instagram profiles
            </p>
          </div>
          <button (click)="loadUsers()" class="btn btn-secondary btn-sm flex items-center gap-1.5">
            <span>🔄</span>
            <span>Refresh Directory</span>
          </button>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Verification</th>
                  <th>Account Status</th>
                  <th>Claimed Displays</th>
                  <th>Instagram Profiles</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users; track user.id) {
                  <tr>
                    <td class="font-bold text-heading">{{ user.displayName }}</td>
                    <td class="font-mono text-sm text-heading">{{ user.email }}</td>
                    <td>
                      @if (user.emailConfirmed) {
                        <span class="badge badge-success">Verified</span>
                      } @else {
                        <span class="badge badge-warning">Unverified</span>
                      }
                    </td>
                    <td>
                      <span class="text-xs font-semibold text-heading uppercase">{{ user.status }}</span>
                    </td>
                    <td class="font-mono font-semibold">{{ user.deviceCount }}</td>
                    <td class="font-mono font-semibold">{{ user.instagramAccountCount }}</td>
                    <td class="text-xs text-muted">{{ user.createdAt | date:'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-page {
      padding-top: 2rem;
      padding-bottom: 4rem;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-canvas);
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  users: AdminUser[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getUsers(1, 100).subscribe({
      next: (res) => (this.users = res),
      error: (err) => console.error('Failed to load users', err)
    });
  }
}
