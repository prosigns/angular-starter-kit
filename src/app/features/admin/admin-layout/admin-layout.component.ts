import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet],
  template: `
    <div class="admin-layout">
      <div class="admin-sidebar">
        <!-- Admin sidebar content will go here -->
      </div>
      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        display: flex;
        height: 100%;
      }
      .admin-sidebar {
        width: 250px;
        background-color: #333;
      }
      .admin-content {
        flex: 1;
        padding: 20px;
      }
    `
  ]
})
export class AdminLayoutComponent {}
