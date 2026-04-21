import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogRef } from '../../services/dynamic-dialog/dialog-ref';
import { DialogComponent } from '../../services/dynamic-dialog/dialog.types';

export interface IApprovalDialogData {
  title: string;
  message: string;
  isApproval: boolean; // true for approval, false for rejection
  confirmText?: string;
  cancelText?: string;
}

export interface IApprovalDialogResult {
  confirmed: boolean;
  remarks: string;
}

@Component({
  selector: 'app-approval-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="approval-dialog border-t-4 border-t-[#041643]"
      role="dialog"
      [attr.aria-labelledby]="'dialog-title'"
      [attr.aria-describedby]="'dialog-description'"
    >
      <!-- Header -->
      <div class="dialog-header">
        <div class="flex items-start space-x-4">
          <!-- Status Icon -->
          <div class="flex-shrink-0 mt-1">
            <div
              class="w-10 h-10 rounded-full flex
                items-center justify-center"
              [ngClass]="data.isApproval ? 'bg-green-100' : 'bg-red-100'"
            >
              <!-- Approval Icon -->
              <svg
                *ngIf="data.isApproval"
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0
                    11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <!-- Rejection Icon -->
              <svg
                *ngIf="!data.isApproval"
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938
                    4h13.856c1.54 0 2.502-1.667
                    1.732-2.5L13.732
                    4c-.77-.833-1.964-.833-2.732
                    0L3.732
                    16.5c-.77.833.192 2.5 1.732
                    2.5z"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Title and Description -->
          <div class="flex-1 min-w-0">
            <h2
              id="dialog-title"
              class="text-xl font-semibold
                text-[#041643] mb-1"
            >
              {{ data.title }}
            </h2>
            <p
              id="dialog-description"
              class="text-sm text-gray-600
                leading-relaxed"
            >
              {{ data.message }}
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <form [formGroup]="approvalForm" (ngSubmit)="onSubmit()" novalidate>
          <!-- Remarks Section -->
          <div class="form-section">
            <div class="form-group">
              <label for="remarks" class="form-label">
                {{ data.isApproval ? 'Approval' : 'Rejection' }}
                Remarks
                <span class="text-red-500 ml-1" aria-label="required">*</span>
              </label>
              <div class="form-field-wrapper">
                <textarea
                  id="remarks"
                  formControlName="remarks"
                  rows="4"
                  class="form-textarea
                    focus:ring-[#041643]
                    focus:border-[#041643]"
                  [class.error]="
                    approvalForm.get('remarks')?.invalid && approvalForm.get('remarks')?.touched
                  "
                  [placeholder]="
                    'Please provide detailed ' +
                    (data.isApproval ? 'approval' : 'rejection') +
                    ' remarks...'
                  "
                  [attr.aria-describedby]="
                    approvalForm.get('remarks')?.invalid && approvalForm.get('remarks')?.touched
                      ? 'remarks-error'
                      : null
                  "
                  [attr.aria-invalid]="
                    approvalForm.get('remarks')?.invalid && approvalForm.get('remarks')?.touched
                  "
                ></textarea>

                <!-- Character Counter -->
                <div class="form-field-footer">
                  <span class="text-xs text-gray-500">
                    {{ approvalForm.get('remarks')?.value?.length || 0 }}
                    / 500 characters
                  </span>
                </div>
              </div>

              <!-- Error Messages -->
              <div
                *ngIf="approvalForm.get('remarks')?.invalid && approvalForm.get('remarks')?.touched"
                id="remarks-error"
                class="form-error"
                role="alert"
                aria-live="polite"
              >
                <div
                  class="flex items-center
                    space-x-2"
                >
                  <svg
                    class="w-4 h-4 text-red-500
                      flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8
                        8 0 0116 0zm-7 4a1 1 0
                        11-2 0 1 1 0 012 0zm-1-9a1
                        1 0 00-1 1v4a1 1 0 102
                        0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span *ngIf="approvalForm.get('remarks')?.errors?.['required']">
                    Remarks are required to proceed
                  </span>
                  <span *ngIf="approvalForm.get('remarks')?.errors?.['minlength']">
                    Please provide at least 10 characters ({{
                      approvalForm.get('remarks')?.errors?.['minlength']?.actualLength
                    }}/10)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Actions Footer -->
      <div class="dialog-actions">
        <div
          class="flex flex-col-reverse
            sm:flex-row sm:justify-end
            sm:space-x-3 space-y-3
            space-y-reverse sm:space-y-0"
        >
          <!-- Cancel Button -->
          <button
            type="button"
            class="btn btn-secondary w-full
              sm:w-auto focus:ring-[#041643]"
            (click)="onCancel()"
            [disabled]="isSubmitting"
            [attr.aria-label]="'Cancel ' + (data.isApproval ? 'approval' : 'rejection')"
          >
            <span class="btn-content">
              {{ data.cancelText || 'Cancel' }}
            </span>
          </button>

          <!-- Confirm Button -->
          <button
            type="submit"
            class="btn w-full sm:w-auto"
            [ngClass]="data.isApproval ? 'btn-success' : 'btn-danger'"
            [disabled]="approvalForm.invalid || isSubmitting"
            (click)="onSubmit()"
            [attr.aria-label]="(data.isApproval ? 'Approve' : 'Reject') + ' with remarks'"
          >
            <span class="btn-content">
              <!-- Loading Spinner -->
              <svg
                *ngIf="isSubmitting"
                class="animate-spin -ml-1 mr-2
                  h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373
                    0 0 5.373 0 12h4zm2
                    5.291A7.962 7.962 0 014
                    12H0c0 3.042 1.135 5.824 3
                    7.938l3-2.647z"
                ></path>
              </svg>

              <!-- Button Text -->
              <span>
                {{
                  isSubmitting
                    ? 'Processing...'
                    : data.confirmText || (data.isApproval ? 'Approve Request' : 'Reject Request')
                }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Dialog Container */
      .approval-dialog {
        @apply bg-white rounded-xl shadow-2xl
          w-full overflow-hidden;
        @apply border border-gray-200;
        min-width: 400px;
        max-width: 100%;
      }

      /* Header Styles */
      .dialog-header {
        @apply px-6 py-5 bg-gradient-to-r
          from-gray-50 to-white border-b
          border-gray-200;
      }

      /* Content Styles */
      .dialog-content {
        @apply px-6 py-6;
      }

      /* Form Styles */
      .form-section {
        @apply space-y-6;
      }

      .form-group {
        @apply space-y-2;
      }

      .form-label {
        @apply block text-sm font-semibold
          text-gray-800 mb-2;
      }

      .form-field-wrapper {
        @apply relative;
      }

      .form-textarea {
        @apply w-full px-4 py-3 text-sm border
          border-gray-300 rounded-lg shadow-sm;
        @apply focus:outline-none focus:ring-2;
        @apply transition-all duration-200
          resize-none;
        @apply placeholder-gray-400;
      }

      .form-textarea.error {
        @apply border-red-300 focus:ring-red-500
          focus:border-red-500;
        @apply bg-red-50;
      }

      .form-field-footer {
        @apply flex justify-end mt-1 px-1;
      }

      .form-error {
        @apply mt-2 text-sm text-red-600
          bg-red-50 border border-red-200
          rounded-md p-3;
      }

      /* Actions Footer */
      .dialog-actions {
        @apply px-6 py-4 bg-gray-50 border-t
          border-gray-200;
      }

      /* Button Styles */
      .btn {
        @apply inline-flex items-center
          justify-center px-6 py-3 text-sm
          font-medium rounded-lg;
        @apply focus:outline-none focus:ring-2
          focus:ring-offset-2 transition-all
          duration-200;
        @apply disabled:opacity-50
          disabled:cursor-not-allowed;
        @apply min-h-[44px];
      }

      .btn-content {
        @apply flex items-center justify-center;
      }

      .btn-secondary {
        @apply text-gray-700 bg-white border-2
          border-gray-300;
        @apply hover:bg-gray-50
          hover:border-gray-400;
        @apply disabled:hover:bg-white
          disabled:hover:border-gray-300;
      }

      .btn-success {
        @apply text-white bg-green-600 border-2
          border-green-600;
        @apply hover:bg-green-700
          hover:border-green-700
          focus:ring-green-500;
        @apply disabled:hover:bg-green-600
          disabled:hover:border-green-600;
      }

      .btn-danger {
        @apply text-white bg-red-600 border-2
          border-red-600;
        @apply hover:bg-red-700
          hover:border-red-700
          focus:ring-red-500;
        @apply disabled:hover:bg-red-600
          disabled:hover:border-red-600;
      }

      /* Responsive Design */
      @media (max-width: 640px) {
        .approval-dialog {
          @apply mx-2;
          min-width: 320px;
          max-width: calc(100vw - 16px);
        }

        .dialog-header,
        .dialog-content,
        .dialog-actions {
          @apply px-4;
        }

        .dialog-header {
          @apply py-4;
        }

        .dialog-content {
          @apply py-4;
        }
      }

      /* Focus Styles for Accessibility */
      .btn:focus-visible {
        @apply ring-2 ring-offset-2;
      }

      .form-textarea:focus-visible {
        @apply ring-2;
      }

      /* Animation for Loading State */
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `
  ]
})
export class ApprovalDialogComponent
  implements OnInit, DialogComponent<IApprovalDialogData, IApprovalDialogResult>
{
  // Public fields
  public dialogRef?: DialogRef<IApprovalDialogResult>;
  public dialogData?: IApprovalDialogData;
  public approvalForm!: FormGroup;
  public isSubmitting = false;

  // Private fields
  private _fb = inject(FormBuilder);
  // Support data passed from the components-based DynamicDialogService
  // Some parts of the app use a different dynamic dialog that sets
  // `data` instead of `dialogData`
  private _data?: IApprovalDialogData;

  // Unified getter to support both `dialogData` (services version)
  // and `data` (components version)
  public get data(): IApprovalDialogData {
    return (
      this.dialogData ||
      this._data || {
        title: 'Confirmation',
        message: 'Please provide your remarks',
        isApproval: true
      }
    );
  }

  public set data(value: IApprovalDialogData | undefined) {
    this._data = value;
  }

  public ngOnInit(): void {
    // Data is set by the DynamicDialogComponent during component
    // creation. If additional data was passed, it would be merged
    // here.

    // Initialize form with enhanced validation
    this.approvalForm = this._fb.group({
      remarks: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  public onSubmit(): void {
    if (this.approvalForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      this.dialogRef?.close({
        confirmed: true,
        remarks: this.approvalForm.get('remarks')?.value || ''
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.approvalForm.controls).forEach(key => {
        this.approvalForm.get(key)?.markAsTouched();
      });
    }
  }

  public onCancel(): void {
    this.dialogRef?.close({
      confirmed: false,
      remarks: ''
    });
  }
}
