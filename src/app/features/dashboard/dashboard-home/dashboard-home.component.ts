import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  template: `
    <div class="dashboard-home">
      <h1>Dashboard</h1>

      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-title">Total Users</div>
          <div class="stat-value">1,250</div>
          <div class="stat-change positive">+12% from last month</div>
        </div>

        <div class="stat-card">
          <div class="stat-title">Revenue</div>
          <div class="stat-value">$52,450</div>
          <div class="stat-change positive">+8% from last month</div>
        </div>

        <div class="stat-card">
          <div class="stat-title">Active Sessions</div>
          <div class="stat-value">524</div>
          <div class="stat-change negative">-3% from last month</div>
        </div>

        <div class="stat-card">
          <div class="stat-title">Conversion Rate</div>
          <div class="stat-value">12.5%</div>
          <div class="stat-change positive">+2% from last month</div>
        </div>
      </div>

      <div class="dashboard-widgets">
        <div class="widget">
          <h2>Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-time">10:45 AM</div>
              <div class="activity-content">New user registered: Jane Smith</div>
            </div>
            <div class="activity-item">
              <div class="activity-time">09:32 AM</div>
              <div class="activity-content">Payment received: Order #1234</div>
            </div>
            <div class="activity-item">
              <div class="activity-time">Yesterday</div>
              <div class="activity-content">Server maintenance completed</div>
            </div>
            <div class="activity-item">
              <div class="activity-time">Yesterday</div>
              <div class="activity-content">New feature deployed: User Analytics</div>
            </div>
          </div>
        </div>

        <div class="widget">
          <h2>Quick Actions</h2>
          <div class="quick-actions">
            <button class="action-button">Add New User</button>
            <button class="action-button">Run Reports</button>
            <button class="action-button">View Settings</button>
            <button class="action-button">Update Profile</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-home {
        padding: 20px;
      }

      h1 {
        margin-bottom: 24px;
        color: #333;
      }

      .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .stat-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .stat-change {
        font-size: 12px;
      }

      .positive {
        color: #4caf50;
      }

      .negative {
        color: #f44336;
      }

      .dashboard-widgets {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .widget {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      h2 {
        margin-top: 0;
        margin-bottom: 16px;
        color: #333;
        font-size: 18px;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .activity-item {
        display: flex;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
      }

      .activity-time {
        width: 80px;
        color: #666;
        font-size: 14px;
      }

      .activity-content {
        flex: 1;
      }

      .quick-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .action-button {
        padding: 12px;
        background-color: #f5f5f5;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .action-button:hover {
        background-color: #e0e0e0;
      }
    `
  ]
})
export class DashboardHomeComponent {}
