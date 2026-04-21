import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  forwardRef,
  inject,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  switchMap,
  of,
  catchError
} from 'rxjs';
import { HttpService } from '@core/services/http.service';
import { ApiModuleEnum } from '@core/enums/api-modules.enum';
import { OutsideClickService } from '@core/services/outside-click.service';

export interface ISearchableDropdownConfig {
  endpoint?: string;
  module?: ApiModuleEnum;
  searchParam?: string;
  additionalParams?: Record<string, string | number | boolean>;
  displayProperty: string;
  valueProperty: string;
  placeholder?: string;
  searchPlaceholder?: string;
  debounceTime?: number;
  minSearchLength?: number;
  noResultsText?: string;
  loadingText?: string;
}

export type SearchableDropdownConfig = ISearchableDropdownConfig;

export type DropdownOption = Record<string, string | number | boolean | null>;

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @Input() public config?: ISearchableDropdownConfig;
  @Input() public options: DropdownOption[] = [];
  @Input() public disabled = false;
  @Input() public readonly = false;
  @Input() public required = false;
  @Input() public label = '';
  @Input() public errorMessage = '';
  @Input() public placeholder = 'Select an option';
  @Input() public displayProperty = 'name';
  @Input() public valueProperty = 'id';
  @Input() public value: string | number | null = null;

  @Output() public valueChange = new EventEmitter<string | number | null>();
  @Output() public selectionChange = new EventEmitter<DropdownOption | null>();
  @Output() public searchChange = new EventEmitter<string>();

  @ViewChild('searchInput')
  public searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdown')
  public dropdown!: ElementRef<HTMLDivElement>;

  public isOpen = false;
  public isLoading = false;
  public searchTerm = '';
  public internalOptions: DropdownOption[] = [];
  public filteredOptions: DropdownOption[] = [];
  public selectedOption: DropdownOption | null = null;
  public highlightedIndex = -1;
  public openUp = false;
  public pendingValue: string | number | null = null;
  public panelStyle: {
    top: string;
    left: string;
    width: string;
  } = {
    top: '0px',
    left: '0px',
    width: '0px'
  };

  private _httpService = inject(HttpService);
  private _outsideClickService = inject(OutsideClickService);
  private _destroy$ = new Subject<void>();
  private _searchSubject = new Subject<string>();
  private _outsideClickUnsubscribe?: () => void;

  @HostListener('window:resize')
  public onWindowResize(): void {
    if (this.isOpen) {
      this._setDropdownDirection();
    }
  }

  @HostListener('window:scroll')
  public onWindowScroll(): void {
    if (this.isOpen) {
      this._updatePanelPosition();
    }
  }

  public ngOnInit(): void {
    this._initializeConfig();
    this._initializeOptions();
    this._setupSearch();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();

    if (this._outsideClickUnsubscribe) {
      this._outsideClickUnsubscribe();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // eslint-disable-next-line no-console
    console.log('Dropdown ngOnChanges called with:', changes);

    if (changes['value']) {
      // eslint-disable-next-line no-console
      console.log(
        'Value changed from',
        changes['value'].previousValue,
        'to',
        changes['value'].currentValue
      );
      this.writeValue(this.value);
    }

    if (changes['options']) {
      // eslint-disable-next-line no-console
      console.log('Options changed:', this.options);
      this._initializeOptions();

      if (this.value && !this.selectedOption) {
        // eslint-disable-next-line no-console
        console.log('Have value but no selectedOption, trying to find in new options');
        this.writeValue(this.value);
      }
    }
  }

  public getDisplayValue(option: DropdownOption): string {
    const displayProp = this.config?.displayProperty || this.displayProperty;
    return String(option[displayProp] || '');
  }

  public getValue(option: DropdownOption): string | number | boolean | null {
    const valueProp = this.config?.valueProperty || this.valueProperty;
    return option[valueProp];
  }

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchChange.emit(this.searchTerm);
    this._searchSubject.next(this.searchTerm);

    if (!this.isOpen) {
      this.openDropdown();
    }

    this._filterOptions();
  }

  public onSearchFocus(): void {
    if (this.readonly) {
      return;
    }
    this.openDropdown();
    if (this.internalOptions.length === 0 && this.config?.endpoint) {
      this._searchSubject.next(this.searchTerm);
    } else if (!this.searchTerm) {
      if (this.config?.endpoint) {
        this._searchSubject.next('');
      } else {
        this._filterOptions();
      }
    }
  }

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (this.readonly) {
      return;
    }
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  public openDropdown(): void {
    if (!this.disabled && !this.readonly) {
      this.isOpen = true;
      this._setDropdownDirection();
      this._updatePanelPosition();
      this._setupClickOutside();
    }
  }

  public closeDropdown(): void {
    this.isOpen = false;
    this.openUp = false;
    this.highlightedIndex = -1;
    this._onTouched();

    // Clean up outside click listener
    if (this._outsideClickUnsubscribe) {
      this._outsideClickUnsubscribe();
      this._outsideClickUnsubscribe = undefined;
    }
  }

  public selectOption(option: DropdownOption): void {
    this.selectedOption = option;
    this.searchTerm = this.getDisplayValue(option);
    this.closeDropdown();

    const value = this.getValue(option);
    this.value = typeof value === 'boolean' ? null : value;
    this._onChange(typeof value === 'boolean' ? null : value);
    this.valueChange.emit(typeof value === 'boolean' ? null : value);
    this.selectionChange.emit(option);
  }

  public clearSelection(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedOption = null;
    this.searchTerm = '';
    this.value = null;
    this._onChange(null);
    this.valueChange.emit(null);
    this.selectionChange.emit(null);
    this._filterOptions();
  }

  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._navigateOptions(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._navigateOptions(-1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.filteredOptions[this.highlightedIndex]) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  public onOptionKeyDown(event: KeyboardEvent, option: DropdownOption): void {
    switch (event.key) {
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        this.selectOption(option);
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        this.searchInput.nativeElement.focus();
        break;
    }
  }

  // ControlValueAccessor implementation
  public writeValue(value: string | number | null): void {
    // eslint-disable-next-line no-console
    console.log('Dropdown writeValue called with:', value);
    // eslint-disable-next-line no-console
    console.log('Current internalOptions:', this.internalOptions);

    this.value = value;

    if (value !== null && value !== undefined) {
      // Find the option that matches the value
      const option = this.internalOptions.find(opt => this.getValue(opt) === value);
      // eslint-disable-next-line no-console
      console.log('Found matching option:', option);

      if (option) {
        this.selectedOption = option;
        this.searchTerm = this.getDisplayValue(option);
        // eslint-disable-next-line no-console
        console.log('Set selectedOption and searchTerm:', this.selectedOption, this.searchTerm);
      } else {
        this.pendingValue = value;
        // eslint-disable-next-line no-console
        console.log('Option not found, storing pendingValue:', this.pendingValue);

        this.selectedOption = null;
        this.searchTerm = '';
      }
    } else {
      this.selectedOption = null;
      this.searchTerm = '';
      // eslint-disable-next-line no-console
      console.log('Cleared selection');
    }
  }

  public registerOnChange(fn: (value: string | number | null) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Track by function for ngFor performance
  public trackByFn(index: number, item: DropdownOption): string | number {
    const value = this.getValue(item);
    return typeof value === 'boolean' || value === null ? index : value;
  }

  // ControlValueAccessor callbacks (arrow function fields = methods per ESLint)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _onChange = (_value: string | number | null): void => {
    // This will be overridden by registerOnChange
  };
  private _onTouched = (): void => {
    // This will be overridden by registerOnTouched
  };

  private _initializeConfig(): void {
    // Set default values for config
    if (this.config) {
      this.config = {
        searchParam: 'search',
        debounceTime: 300,
        minSearchLength: 0,
        placeholder: this.placeholder,
        searchPlaceholder: 'Search...',
        noResultsText: 'No results found',
        loadingText: 'Loading...',
        ...this.config,
        displayProperty: this.config.displayProperty || this.displayProperty,
        valueProperty: this.config.valueProperty || this.valueProperty
      };
    }
  }

  private _initializeOptions(): void {
    // eslint-disable-next-line no-console
    console.log('initializeOptions called with options:', this.options);

    if (this.options && this.options.length > 0) {
      // Use static options
      this.internalOptions = [...this.options];
      // eslint-disable-next-line no-console
      console.log('Set internalOptions:', this.internalOptions);

      this._filterOptions();

      if (this.pendingValue !== null && this.pendingValue !== undefined) {
        // eslint-disable-next-line no-console
        console.log('Found pendingValue, trying to find matching option:', this.pendingValue);
        const option = this.internalOptions.find(opt => this.getValue(opt) === this.pendingValue);
        // eslint-disable-next-line no-console
        console.log('Found matching option for pendingValue?', option);

        if (option) {
          this.selectedOption = option;
          this.searchTerm = this.getDisplayValue(option);
          // eslint-disable-next-line no-console
          console.log(
            'Updated selectedOption and searchTerm from pendingValue:',
            this.selectedOption,
            this.searchTerm
          );
          this.pendingValue = null;
        } else {
          // eslint-disable-next-line no-console
          console.log('Pending value not found in options:', this.pendingValue);
        }
      } else if (this.value !== null && this.value !== undefined) {
        // eslint-disable-next-line no-console
        console.log('Have value, trying to find matching option:', this.value);
        const option = this.internalOptions.find(opt => this.getValue(opt) === this.value);
        // eslint-disable-next-line no-console
        console.log('Found matching option?', option);

        if (option) {
          this.selectedOption = option;
          this.searchTerm = this.getDisplayValue(option);
          // eslint-disable-next-line no-console
          console.log(
            'Updated selectedOption and searchTerm:',
            this.selectedOption,
            this.searchTerm
          );
        }
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('No options provided or empty options array');
    }
  }

  private _setupSearch(): void {
    this._searchSubject
      .pipe(
        debounceTime(this.config?.debounceTime || 300),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
        switchMap(searchTerm => {
          if (this.config?.endpoint) {
            // API-based search
            if (searchTerm.length < (this.config.minSearchLength || 0)) {
              return of([]);
            }
            return this._fetchOptions(searchTerm);
          } else {
            // Static options search
            this._filterOptions();
            return of(this.internalOptions);
          }
        })
      )
      .subscribe(options => {
        if (this.config?.endpoint) {
          this.internalOptions = options;
        }
        this._filterOptions();
        this.isLoading = false;
      });
  }

  private _setupClickOutside(): void {
    // Clean up any existing registration first
    if (this._outsideClickUnsubscribe) {
      this._outsideClickUnsubscribe();
    }

    this._outsideClickUnsubscribe = this._outsideClickService.register(
      `dropdown-${Math.random().toString(36).substr(2, 9)}`,
      {
        element: this.dropdown,
        callback: () => {
          if (this.isOpen) {
            this.closeDropdown();
          }
        },
        enabled: true
      }
    );
  }

  private _fetchOptions(searchTerm: string): Observable<DropdownOption[]> {
    if (!this.config?.endpoint) {
      return of([]);
    }

    this.isLoading = true;

    const params: Record<string, string | number | boolean> = {
      ...this.config.additionalParams
    };

    if ('pageSize' in params) {
      delete params['pageSize'];
    }
    if ('PageSize' in params) {
      delete params['PageSize'];
    }
    if ('page' in params) {
      delete params['page'];
    }
    if ('Page' in params) {
      delete params['Page'];
    }

    if (this.config.searchParam && searchTerm) {
      params[this.config.searchParam] = searchTerm;
    }

    const resolved = this._resolveModuleAndEndpoint(this.config.endpoint, this.config.module);

    return this._httpService
      .get<DropdownOption[]>(resolved.module, resolved.endpoint, { params })
      .pipe(
        catchError(error => {
          // eslint-disable-next-line no-console
          console.error('Error fetching dropdown options:', error);
          this.isLoading = false;
          return of([]);
        }),
        takeUntil(this._destroy$)
      );
  }

  private _resolveModuleAndEndpoint(
    rawEndpoint: string,
    moduleOverride?: ApiModuleEnum
  ): { module: ApiModuleEnum; endpoint: string } {
    const normalizedEndpoint = rawEndpoint.startsWith('/') ? rawEndpoint : `/${rawEndpoint}`;
    if (moduleOverride) {
      return {
        module: moduleOverride,
        endpoint: normalizedEndpoint
      };
    }

    const [pathOnly] = normalizedEndpoint.split('?');
    const trimmed = pathOnly.replace(/^\/+/, '');
    const [firstSegment, ...restSegments] = trimmed.split('/').filter(Boolean);

    if (!firstSegment) {
      return {
        module: ApiModuleEnum.ALL,
        endpoint: normalizedEndpoint
      };
    }

    const firstLower = firstSegment.toLowerCase();
    const moduleMatch = (Object.values(ApiModuleEnum) as string[]).find(
      m => m.toLowerCase() === firstLower
    );

    if (!moduleMatch) {
      return {
        module: ApiModuleEnum.ALL,
        endpoint: normalizedEndpoint
      };
    }

    const endpoint = restSegments.length > 0 ? `/${restSegments.join('/')}` : '/';
    return {
      module: moduleMatch as ApiModuleEnum,
      endpoint
    };
  }

  private _filterOptions(): void {
    if (!this.searchTerm) {
      this.filteredOptions = [...this.internalOptions];
    } else {
      this.filteredOptions = this.internalOptions.filter(option =>
        this.getDisplayValue(option).toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.highlightedIndex = -1;
  }

  private _setDropdownDirection(): void {
    try {
      const rect = this.dropdown?.nativeElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      // keep in sync with CSS max-height
      const estimatedListHeight = 200;
      this.openUp = spaceBelow < estimatedListHeight && spaceAbove > spaceBelow;
      this._updatePanelPosition();
    } catch {
      this.openUp = false;
    }
  }

  private _updatePanelPosition(): void {
    try {
      const rect = this.dropdown?.nativeElement.getBoundingClientRect();
      const margin = 4;
      const estimatedListHeight = 200;
      const top = this.openUp
        ? Math.max(0, rect.top - estimatedListHeight - margin)
        : rect.bottom + margin;
      this.panelStyle = {
        top: `${top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`
      };
    } catch {
      this.panelStyle = {
        top: '0px',
        left: '0px',
        width: '0px'
      };
    }
  }

  private _navigateOptions(direction: number): void {
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }

    const maxIndex = this.filteredOptions.length - 1;
    this.highlightedIndex += direction;

    if (this.highlightedIndex < 0) {
      this.highlightedIndex = maxIndex;
    } else if (this.highlightedIndex > maxIndex) {
      this.highlightedIndex = 0;
    }
  }
}
