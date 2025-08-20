import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [RouterLink],
  template: `
    <div class="users-container">
      <div class="users-header">
        <h1>Users Management</h1>
        <button class="add-user-btn" [routerLink]="['../user/new']">Add New User</button>
      </div>

      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>john&#64;example.com</td>
            <td>Admin</td>
            <td>Active</td>
            <td>
              <button class="edit-btn" [routerLink]="['../user/edit', 1]">Edit</button>
              <button class="delete-btn">Delete</button>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jane Smith</td>
            <td>jane&#64;example.com</td>
            <td>User</td>
            <td>Active</td>
            <td>
              <button class="edit-btn" [routerLink]="['../user/edit', 2]">Edit</button>
              <button class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .users-container {
        padding: 20px;
      }
      .users-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .add-user-btn {
        background-color: #4caf50;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      .users-table {
        width: 100%;
        border-collapse: collapse;
      }
      .users-table th,
      .users-table td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      .users-table th {
        background-color: #f2f2f2;
      }
      .users-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .edit-btn,
      .delete-btn {
        margin-right: 5px;
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .edit-btn {
        background-color: #2196f3;
        color: white;
      }
      .delete-btn {
        background-color: #f44336;
        color: white;
      }
    `
  ]
})
export class UsersComponent {}
