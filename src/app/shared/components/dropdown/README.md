# Searchable Dropdown Component

A reusable Angular component that provides a searchable dropdown similar to Select2, with configurable HTTP endpoint integration.

## Features

- 🔍 **Search functionality** with debounced input
- 🌐 **HTTP endpoint integration** for dynamic data fetching
- ⌨️ **Keyboard navigation** (Arrow keys, Enter, Escape)
- 🎨 **Modern UI** with Material Design icons
- 📱 **Responsive design** with mobile support
- 🌙 **Dark mode support**
- ♿ **Accessibility** features
- 🔧 **Configurable** options and parameters
- 📝 **Form integration** (Template-driven and Reactive forms)
- 🎯 **TypeScript** support with proper typing

## Usage

### Basic Usage

```typescript
import { SearchableDropdownComponent, SearchableDropdownConfig } from '@shared/components';

@Component({
  // ...
  imports: [SearchableDropdownComponent]
})
export class MyComponent {
  config: SearchableDropdownConfig = {
    endpoint: '/api/items',
    searchParam: 'search',
    displayProperty: 'name',
    valueProperty: 'id',
    placeholder: 'Select an item',
    searchPlaceholder: 'Search items...'
  };

  selectedValue: any = null;
}
```

```html
<app-dropdown
  [config]="config"
  label="Select Item"
  [(ngModel)]="selectedValue"
  (selectionChange)="onSelectionChange($event)">
</app-dropdown>
```

### Reactive Forms

```typescript
import { FormBuilder, FormGroup } from '@angular/forms';

export class MyComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      itemId: [null]
    });
  }
}
```

```html
<form [formGroup]="form">
  <app-dropdown
    [config]="config"
    label="Select Item"
    formControlName="itemId">
  </app-dropdown>
</form>
```

## Configuration

### SearchableDropdownConfig Interface

```typescript
interface SearchableDropdownConfig {
  endpoint: string;                    // Required: API endpoint URL
  searchParam?: string;               // Query parameter name for search (default: 'search')
  additionalParams?: { [key: string]: any }; // Additional query parameters
  displayProperty: string;            // Required: Property to display in dropdown
  valueProperty: string;              // Required: Property to use as value
  placeholder?: string;               // Placeholder text (default: 'Select an option')
  searchPlaceholder?: string;         // Search input placeholder (default: 'Search...')
  debounceTime?: number;             // Search debounce time in ms (default: 300)
  minSearchLength?: number;          // Minimum characters to trigger search (default: 0)
  noResultsText?: string;            // No results message (default: 'No results found')
  loadingText?: string;              // Loading message (default: 'Loading...')
}
```

### Component Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `config` | `SearchableDropdownConfig` | - | **Required** Configuration object |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `required` | `boolean` | `false` | Mark as required field |
| `label` | `string` | `''` | Label text |
| `errorMessage` | `string` | `''` | Error message to display |

### Component Outputs

| Output | Type | Description |
|--------|------|-------------|
| `selectionChange` | `EventEmitter<DropdownOption \| null>` | Emitted when selection changes |
| `searchChange` | `EventEmitter<string>` | Emitted when search term changes |

## API Response Format

The component expects the API to return an array of objects. Each object should have the properties specified in `displayProperty` and `valueProperty`.

### Example API Response

```json
[
  {
    "id": 1,
    "name": "Item 1",
    "description": "Description for item 1"
  },
  {
    "id": 2,
    "name": "Item 2",
    "description": "Description for item 2"
  }
]
```

### Example API Endpoints

```typescript
// Items endpoint
itemsConfig: SearchableDropdownConfig = {
  endpoint: '/item',
  searchParam: 'search',
  displayProperty: 'name',
  valueProperty: 'id'
};

// Brands endpoint with additional parameters
brandsConfig: SearchableDropdownConfig = {
  endpoint: '/brand',
  searchParam: 'q',
  additionalParams: { active: true },
  displayProperty: 'name',
  valueProperty: 'id'
};
```

## Keyboard Navigation

- **Arrow Down/Up**: Navigate through options
- **Enter**: Select highlighted option
- **Escape**: Close dropdown
- **Tab**: Close dropdown and move to next field

## Styling

The component uses CSS custom properties and supports both light and dark themes. You can customize the appearance by overriding the CSS variables or classes.

### Custom Styling Example

```scss
app-dropdown {
  --dropdown-border-color: #your-color;
  --dropdown-focus-color: #your-focus-color;
  --dropdown-background: #your-background;
}
```

## Examples

See the demo component at `./demo/dropdown-demo.component.ts` for complete usage examples including:

- Basic usage with different APIs
- Reactive form integration
- Disabled state
- Custom configurations

## Dependencies

- Angular Material (Icons, Form Field, Input, Button, Progress Spinner)
- RxJS (for HTTP requests and search debouncing)
- HttpService (custom service for API calls)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management