import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-left">
          <div class="logo">Angular Starter Kit</div>
        </div>
        <div class="header-right">
          <div class="user-info">John Doe</div>
        </div>
      </header>

      <div class="dashboard-content">
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <ul>
              <li>
                <a
                  routerLink="/dashboard"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                  >Dashboard</a
                >
              </li>
              <li><a routerLink="/dashboard/profile" routerLinkActive="active">Profile</a></li>
              <li><a routerLink="/dashboard/settings" routerLinkActive="active">Settings</a></li>
              <li><a routerLink="/dashboard/analytics" routerLinkActive="active">Analytics</a></li>
            </ul>
          </nav>
        </aside>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .dashboard-header {
        height: 60px;
        background-color: #3f51b5;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .logo {
        font-size: 1.5rem;
        font-weight: bold;
      }
      .dashboard-content {
        display: flex;
        flex: 1;
      }
      .sidebar {
        width: 240px;
        background-color: #f5f5f5;
        border-right: 1px solid #e0e0e0;
      }
      .sidebar-nav {
        padding: 20px 0;
      }
      .sidebar-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .sidebar-nav li {
        padding: 0;
      }
      .sidebar-nav a {
        display: block;
        padding: 12px 20px;
        color: #333;
        text-decoration: none;
        transition: background-color 0.2s;
      }
      .sidebar-nav a:hover {
        background-color: #eeeeee;
      }
      .sidebar-nav a.active {
        background-color: #e0e0e0;
        border-left: 4px solid #3f51b5;
      }
      .main-content {
        flex: 1;
        padding: 20px;
        background-color: #ffffff;
      }
    `
  ]
})
export class DashboardLayoutComponent {}
