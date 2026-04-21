import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DropdownComponent, SearchableDropdownConfig, DropdownOption } from '../dropdown.component';

@Component({
  selector: 'app-dropdown-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  template: `
    <div class="demo-container">
      <h2>Searchable Dropdown Demo</h2>

      <div class="demo-section">
        <h3>Basic Usage with Items API</h3>
        <app-dropdown
          [config]="itemsConfig"
          label="Select Item"
          [required]="true"
          [(ngModel)]="selectedItemId"
          [ngModelOptions]="{ standalone: true }"
          (selectionChange)="onItemSelection($event)"
        ></app-dropdown>

        <p *ngIf="selectedItemId">Selected Item ID: {{ selectedItemId }}</p>
      </div>

      <div class="demo-section">
        <h3>Usage with Brands API</h3>
        <app-dropdown
          [config]="brandsConfig"
          label="Select Brand"
          [(ngModel)]="selectedBrandId"
          [ngModelOptions]="{ standalone: true }"
          (selectionChange)="onBrandSelection($event)"
        ></app-dropdown>

        <p *ngIf="selectedBrandId">Selected Brand ID: {{ selectedBrandId }}</p>
      </div>

      <div class="demo-section">
        <h3>Usage in Reactive Form</h3>
        <form [formGroup]="demoForm">
          <app-dropdown
            [config]="itemsConfig"
            label="Item in Form"
            formControlName="itemId"
          ></app-dropdown>

          <app-dropdown
            [config]="brandsConfig"
            label="Brand in Form"
            formControlName="brandId"
          ></app-dropdown>
        </form>

        <div class="form-values">
          <h4>Form Values:</h4>
          <pre>{{ demoForm.value | json }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h3>Disabled State</h3>
        <app-dropdown
          [config]="itemsConfig"
          label="Disabled Dropdown"
          [disabled]="true"
          [(ngModel)]="selectedItemId"
          [ngModelOptions]="{ standalone: true }"
        ></app-dropdown>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .demo-section {
        margin-bottom: 3rem;
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background: #f9fafb;
      }

      h2 {
        color: #111827;
        margin-bottom: 2rem;
        text-align: center;
      }

      h3 {
        color: #374151;
        margin-bottom: 1rem;
        font-size: 1.125rem;
      }

      h4 {
        color: #4b5563;
        margin-bottom: 0.5rem;
        font-size: 1rem;
      }

      p {
        margin-top: 1rem;
        padding: 0.75rem;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 0.375rem;
        color: #1e40af;
        font-weight: 500;
      }

      .form-values {
        margin-top: 1rem;
        padding: 1rem;
        background: #f3f4f6;
        border-radius: 0.375rem;
      }

      pre {
        margin: 0;
        font-size: 0.875rem;
        color: #374151;
      }

      app-dropdown {
        display: block;
        margin-bottom: 1rem;
      }
    `
  ]
})
export class DropdownDemoComponent {
  public selectedItemId: string | number | null = null;
  public selectedBrandId: string | number | null = null;
  public demoForm: FormGroup;

  // Configuration for items dropdown
  public itemsConfig: SearchableDropdownConfig = {
    endpoint: '/item',
    searchParam: 'search',
    displayProperty: 'name',
    valueProperty: 'id',
    placeholder: 'Select an item',
    searchPlaceholder: 'Search items...',
    debounceTime: 300,
    minSearchLength: 0,
    noResultsText: 'No items found',
    loadingText: 'Loading items...'
  };

  // Configuration for brands dropdown
  public brandsConfig: SearchableDropdownConfig = {
    endpoint: '/brand',
    searchParam: 'search',
    displayProperty: 'name',
    valueProperty: 'id',
    placeholder: 'Select a brand',
    searchPlaceholder: 'Search brands...',
    debounceTime: 300,
    minSearchLength: 0,
    noResultsText: 'No brands found',
    loadingText: 'Loading brands...'
  };

  private _fb = inject(FormBuilder);

  constructor() {
    this.demoForm = this._fb.group({
      itemId: [null],
      brandId: [null]
    });
  }

  public onItemSelection(option: DropdownOption | null): void {
    // eslint-disable-next-line no-console
    console.log('Item selected:', option);
  }

  public onBrandSelection(option: DropdownOption | null): void {
    // eslint-disable-next-line no-console
    console.log('Brand selected:', option);
  }
}
