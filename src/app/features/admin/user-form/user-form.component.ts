import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-user-form',
    imports: [ReactiveFormsModule, RouterLink, NgIf],
    template: `
    <div class="user-form-container">
      <h1>{{ isEditMode ? 'Edit User' : 'Create New User' }}</h1>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" formControlName="name" />
          <div class="error" *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched">
            Name is required
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" formControlName="email" />
          <div
            class="error"
            *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched"
          >
            Valid email is required
          </div>
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" formControlName="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" formControlName="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" [routerLink]="['../..']">Cancel</button>
          <button type="submit" [disabled]="userForm.invalid">Save</button>
        </div>
      </form>
    </div>
  `,
    styles: [
        `
      .user-form-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input,
      select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .error {
        color: red;
        font-size: 0.9em;
        margin-top: 5px;
      }
      .form-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
      }
      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button[type='submit'] {
        background-color: #4caf50;
        color: white;
      }
      button[type='submit']:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      button[type='button'] {
        background-color: #f5f5f5;
      }
    `
    ]
})
export class UserFormComponent {
  userForm: FormGroup;
  isEditMode = false;
  userId?: number;

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.userForm = this._fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      status: ['active', Validators.required]
    });

    this._route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.userId = +params['id'];
        // In a real app, you would fetch user data here
        this.populateForm();
      }
    });
  }

  populateForm(): void {
    // Mock data - in a real app, this would come from a service
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active'
    };
    this.userForm.patchValue(userData);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      // Save user - in a real app, this would be handled by a service
      console.log('Form submitted:', this.userForm.value);
      this._router.navigate(['../../'], { relativeTo: this._route });
    }
  }
}
