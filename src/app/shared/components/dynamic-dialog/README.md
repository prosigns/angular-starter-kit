# Dynamic Dialog Component

A flexible and powerful dynamic dialog component for Angular applications, inspired by PrimeNG's DynamicDialog. This component allows you to dynamically load any Angular component inside a modal dialog with full customization options.

## Features

- 🚀 **Dynamic Component Loading**: Load any Angular component dynamically
- 🎨 **Highly Customizable**: Extensive styling and behavior options
- 📱 **Responsive**: Mobile-friendly with responsive breakpoints
- ♿ **Accessible**: Full keyboard navigation and ARIA support
- 🎭 **Modal & Non-Modal**: Support for both modal and non-modal dialogs
- 🔧 **Resizable & Draggable**: Interactive dialog manipulation
- 📏 **Maximizable**: Full-screen dialog support
- 🎯 **Type Safe**: Full TypeScript support with interfaces

## Installation

1. Copy the `dynamic-dialog` folder to your `shared/components` directory
2. Import the required components in your module or standalone component

## Basic Usage

### 1. Setup the Dialog Host

Add the dialog host directive to your app component or any parent component:

```typescript
import { Component } from '@angular/core';
import { DynamicDialogHostDirective, DynamicDialogService } from './shared/components/dynamic-dialog';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container" appDynamicDialogHost>
      <!-- Your app content -->
      <router-outlet></router-outlet>
    </div>
  `,
  imports: [DynamicDialogHostDirective],
  providers: [DynamicDialogService]
})
export class AppComponent {}
```

### 2. Create a Dialog Content Component

```typescript
import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from './shared/components/dynamic-dialog';
import { DynamicDialogData, DynamicDialogComponent } from './shared/components/dynamic-dialog';

@Component({
  selector: 'app-my-dialog-content',
  template: `
    <div class="dialog-content">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      
      <div class="dialog-actions">
        <button (click)="cancel()">Cancel</button>
        <button (click)="confirm()">Confirm</button>
      </div>
    </div>
  `
})
export class MyDialogContentComponent implements OnInit, DynamicDialogData, DynamicDialogComponent {
  data?: any;
  dialogRef?: DynamicDialogRef;
  
  title: string = '';
  message: string = '';

  ngOnInit(): void {
    if (this.data) {
      this.title = this.data.title || 'Dialog';
      this.message = this.data.message || 'No message provided';
    }
  }

  cancel(): void {
    this.dialogRef?.close(null);
  }

  confirm(): void {
    this.dialogRef?.close({ confirmed: true, timestamp: new Date() });
  }
}
```

### 3. Open the Dialog

```typescript
import { Component } from '@angular/core';
import { DynamicDialogService, DynamicDialogRef } from './shared/components/dynamic-dialog';
import { MyDialogContentComponent } from './my-dialog-content.component';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="openDialog()">Open Dialog</button>
    <div *ngIf="result">
      Result: {{ result | json }}
    </div>
  `
})
export class ExampleComponent {
  result: any = null;

  constructor(private dynamicDialogService: DynamicDialogService) {}

  openDialog(): void {
    const ref: DynamicDialogRef = this.dynamicDialogService.open(MyDialogContentComponent, {
      header: 'Confirmation Dialog',
      width: '50vw',
      height: '30vh',
      modal: true,
      closable: true,
      data: {
        title: 'Please Confirm',
        message: 'Are you sure you want to proceed?'
      }
    });

    ref.onClose.subscribe((result) => {
      if (result) {
        this.result = result;
        console.log('Dialog closed with result:', result);
      }
    });
  }
}
```

## Configuration Options

The `DynamicDialogConfig` interface provides extensive customization options:

```typescript
interface DynamicDialogConfig {
  header?: string;                    // Dialog title
  width?: string;                     // Dialog width (e.g., '50vw', '600px')
  height?: string;                    // Dialog height (e.g., '70vh', '400px')
  modal?: boolean;                    // Modal behavior (default: true)
  closable?: boolean;                 // Show close button (default: true)
  maximizable?: boolean;              // Show maximize button (default: false)
  resizable?: boolean;                // Allow resizing (default: false)
  draggable?: boolean;                // Allow dragging (default: false)
  data?: any;                         // Data to pass to component
  styleClass?: string;                // Custom CSS class
  contentStyle?: { [key: string]: any }; // Inline styles
  baseZIndex?: number;                // Base z-index (default: 1000)
  breakpoints?: { [key: string]: string }; // Responsive breakpoints
  closeOnEscape?: boolean;            // Close on ESC key (default: true)
  showBackdrop?: boolean;             // Show backdrop (default: true)
  backdropClass?: string;             // Custom backdrop class
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 
            'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoFocus?: boolean;                // Auto-focus first element (default: true)
  restoreFocus?: boolean;             // Restore focus on close (default: true)
  minWidth?: string;                  // Minimum width
  minHeight?: string;                 // Minimum height
  maxWidth?: string;                  // Maximum width
  maxHeight?: string;                 // Maximum height
}
```

## Advanced Examples

### Responsive Dialog

```typescript
const ref = this.dynamicDialogService.open(MyComponent, {
  header: 'Responsive Dialog',
  width: '70vw',
  height: '60vh',
  breakpoints: {
    '960px': '80vw',
    '640px': '95vw'
  },
  modal: true,
  maximizable: true,
  resizable: true
});
```

### Non-Modal Dialog

```typescript
const ref = this.dynamicDialogService.open(MyComponent, {
  header: 'Non-Modal Dialog',
  width: '400px',
  height: '300px',
  modal: false,
  position: 'top-right',
  draggable: true
});
```

### Dialog with Custom Styling

```typescript
const ref = this.dynamicDialogService.open(MyComponent, {
  header: 'Custom Styled Dialog',
  width: '60vw',
  styleClass: 'custom-dialog',
  contentStyle: {
    'background-color': '#f8f9fa',
    'border-radius': '12px'
  },
  backdropClass: 'custom-backdrop'
});
```

## Service Methods

### DynamicDialogService

- `open(component: Type<any>, config?: DynamicDialogConfig): DynamicDialogRef`
  - Opens a new dialog with the specified component

- `closeAll(): void`
  - Closes all open dialogs

- `setViewContainerRef(viewContainerRef: ViewContainerRef): void`
  - Sets the view container for dialog rendering

### DynamicDialogRef

- `close(result?: any): void`
  - Closes the dialog with optional result

- `maximize(): void`
  - Maximizes the dialog

- `onClose: Subject<any>`
  - Observable that emits when dialog is closed

- `onMaximize: Subject<boolean>`
  - Observable that emits when dialog is maximized/restored

## Component Interfaces

Implement these interfaces in your dialog content components:

```typescript
// For components that receive data
interface DynamicDialogData {
  data?: any;
}

// For components that need dialog reference
interface DynamicDialogComponent {
  dialogRef?: DynamicDialogRef;
}
```

## Styling

The component comes with comprehensive SCSS styling. You can customize the appearance by:

1. **Using styleClass**: Add custom CSS classes
2. **CSS Custom Properties**: Override CSS variables
3. **Global Styles**: Override component styles globally

### CSS Custom Properties

```css
:root {
  --dynamic-dialog-border-radius: 8px;
  --dynamic-dialog-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  --dynamic-dialog-header-bg: #ffffff;
  --dynamic-dialog-header-color: #333333;
  --dynamic-dialog-backdrop-bg: rgba(0, 0, 0, 0.5);
}
```

## Demo Component

A complete demo component is included (`DynamicDialogDemoComponent`) that showcases all features:

```typescript
import { DynamicDialogDemoComponent } from './shared/components/dynamic-dialog';

// Use in your routing or component
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Angular 15+
- RxJS 7+
- TypeScript 4.7+

## License

MIT License - feel free to use in your projects!