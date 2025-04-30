import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-value">1,250</p>
        </div>
        <div class="stat-card">
          <h3>New Registrations</h3>
          <p class="stat-value">35</p>
        </div>
        <div class="stat-card">
          <h3>Active Sessions</h3>
          <p class="stat-value">87</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        padding: 20px;
      }
      .dashboard-stats {
        display: flex;
        gap: 20px;
        margin-top: 20px;
      }
      .stat-card {
        background-color: #f5f5f5;
        border-radius: 8px;
        padding: 20px;
        min-width: 200px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .stat-value {
        font-size: 2rem;
        font-weight: bold;
        margin-top: 10px;
      }
    `
  ]
})
export class AdminDashboardComponent {}
