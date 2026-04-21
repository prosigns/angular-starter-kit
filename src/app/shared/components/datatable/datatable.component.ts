import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  OnInit,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  inject
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { HttpService } from '@core/services/http.service';
import { ApiModuleEnum } from '@core/enums/api-modules.enum';
import { LoggingService } from '@core/services/logging.service';
import { ConfirmationService, ConfirmationConfig } from '@core/services/confirmation.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import interfaces from standard datatable
import { IColumn, IActionItem } from './interfaces';

// Re-export interfaces for external use
export type { IColumn, IActionItem } from './interfaces';
export type ITableConfig<T = unknown> = IAdminTableConfig<T>;
import { ToastService } from '@core/services/toast.service';

/**
 * Admin Table Configuration
 * Defines all configuration options for the admin datatable
 */
export interface IAdminTableConfig<T = unknown> {
  /**
   * Fetch endpoint for API data
   */
  fetchEndpoint: string;

  /**
   * Delete endpoint for API data
   */
  deleteEndpoint?: string;

  fetchModule?: ApiModuleEnum;

  deleteModule?: ApiModuleEnum;

  /**
   * Additional query parameters to include in API requests
   */
  parameters?: Record<string, unknown>;

  /**
   * Whether to include the search term in API requests
   * @default true
   */
  sendSearchParam?: boolean;

  /**
   * Function to edit items
   */
  editFunction?: (item: T) => void;

  /**
   * Custom action items
   */
  actionItems?: IActionItem<T>[];

  /**
   * Whether to show the checkbox column for selecting rows
   * @default true
   */
  showCheckbox?: boolean;

  /**
   * Whether to show the search input
   * @default true
   */
  showSearch?: boolean;

  /**
   * Whether to show the paginator
   * @default true
   */
  showPaginator?: boolean;

  /**
   * Default page size
   * @default 10
   */
  pageSize?: number;

  /**
   * Available page size options
   * @default [10, 25, 50, 100]
   */
  pageSizeOptions?: number[];

  /**
   * Total Data Length
   * @default 0
   */
  totalCount?: number;

  /**
   * Whether to show the total records count in footer
   * @default true
   */
  showTotalCount?: boolean;

  /**
   * Whether to show the create button in empty state
   * @default true
   */
  showCreateButton?: boolean;

  /**
   * Default sort column
   * @default 'id'
   */
  orderBy?: string;

  /**
   * Default sort direction (true = asc, false = desc)
   * @default false
   */
  sortDirection?: boolean;

  /**
   * Whether to show action column
   * @default true
   */
  showActions?: boolean;

  /**
   * Configuration for empty state
   */
  emptyStateConfig?: {
    icon?: string;
    title?: string;
    message?: string;
  };

  /**
   * Text for the delete confirmation dialog
   */
  deleteConfirmationText?: string;

  /**
   * Whether to auto-refresh after actions
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Component Name for display add button (if no record found)
   */
  componentName: string;

  /**
   * Disable data row checkbox on condition (if needed)
   */
  disableCheckboxFn?: (row: T) => boolean;

  /**
   * Disable data row checkbox on condition (if needed)
   */
  disableDeleteFn?: (row: T) => boolean;

  /**
   * Whether to show a header in the actions menu
   * @default false
   */
  showMenuHeader?: boolean;

  /**
   * Force server-side pagination mode
   * If set, overrides automatic detection from response metadata
   */
  serverSide?: boolean;

  /**
   * Allow rows to grow past the default height when cells use wrapText
   */
  variableRowHeight?: boolean;
}

/**
 * Admin Table Pagination Configuration
 * Defines pagination configuration options for the admin datatable
 */
export interface IPaginationResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Admin Data Table Component
 *
 * A simplified datatable component specifically for admin panels that takes:
 * 1. Columns list
 * 2. Fetch Endpoint
 * 3. Delete endpoint
 * 4. Edit Function
 * 5. Custom Action Items
 */
@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ]
})
export class DatatableComponent<T = unknown>
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  // --- @Input() fields ---
  @Input() public columns: IColumn<T>[] = [];
  @Input() public fetchEndpoint = '';
  @Input() public deleteEndpoint = '';
  @Input() public actionItems: IActionItem<T>[] = [];
  @Input() public data: T[] | null = null;
  @Input() public config: IAdminTableConfig<T> = {
    fetchEndpoint: '',
    showCheckbox: true,
    showSearch: true,
    showPaginator: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    totalCount: 0,
    showTotalCount: true,
    showCreateButton: false,
    orderBy: 'id',
    componentName: '',
    sortDirection: false,
    showActions: true,
    autoRefresh: true,
    emptyStateConfig: {
      icon: 'search_off',
      title: 'No data found',
      message: 'Try adjusting your search or filters'
    },
    parameters: {},
    sendSearchParam: true
  };

  // --- @Output() fields ---
  @Output() public datatableLength = new EventEmitter<number>();
  @Output() public rowClick = new EventEmitter<T>();
  @Output() public selectionChange = new EventEmitter<T[]>();
  @Output() public actionClick = new EventEmitter<{
    action: string;
    data: T;
  }>();
  @Output() public openForm = new EventEmitter<void>();
  @Output() public responseReceived = new EventEmitter<unknown>();

  // --- @ViewChild / @ViewChildren ---
  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatSort) public sort!: MatSort;
  @ViewChildren(MatMenuTrigger)
  public menuTriggers!: QueryList<MatMenuTrigger>;

  // --- Public fields ---
  public displayedColumns: string[] = [];
  public dataSource = new MatTableDataSource<T>([]);
  public selection = new SelectionModel<T>(true, []);
  public isLoading = false;
  public error: string | null = null;
  public searchValue = '';
  public currentPage = 1;

  // --- Private fields ---
  private readonly _destroy$ = new Subject<void>();
  // Keep single instance
  private readonly _currentRequest$ = new Subject<void>();
  private _isViewInitialized = false; // Track view initialization
  private _useServerPagination = false;
  private readonly _httpService: HttpService = inject(HttpService);
  private readonly _logger: LoggingService = inject(LoggingService);
  private readonly _snackbarService: ToastService = inject(ToastService);
  private readonly _confirmationService: ConfirmationService = inject(ConfirmationService);

  // --- Public getters ---
  // Table configuration for backward compatibility
  public get showCheckbox(): boolean {
    return this.config?.showCheckbox ?? true;
  }

  public get showActions(): boolean {
    return this.config?.showActions ?? true;
  }

  public get pageSize(): number {
    return this.config?.pageSize ?? 10;
  }

  public get pageSizeOptions(): number[] {
    return this.config?.pageSizeOptions ?? [10, 25, 50, 100];
  }

  // --- Decorated method (arrow function @Input) ---
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Input() public editFunction = (_item: T): void => {
    // Default implementation is empty
  };

  // --- Lifecycle hooks ---
  public ngOnInit(): void {
    this._logger.debug('Admin Datatable initializing...');

    // Use config values if provided, otherwise fall back to individual inputs
    if (this.config.fetchEndpoint) {
      this.fetchEndpoint = this.config.fetchEndpoint;
    } else {
      this.config.fetchEndpoint = this.fetchEndpoint;
    }

    if (this.config.deleteEndpoint) {
      this.deleteEndpoint = this.config.deleteEndpoint;
    } else {
      this.config.deleteEndpoint = this.deleteEndpoint;
    }

    if (this.config.editFunction) {
      this.editFunction = this.config.editFunction;
    }

    if (this.config.actionItems && this.config.actionItems.length > 0) {
      this.actionItems = this.config.actionItems;
    } else {
      this.config.actionItems = this.actionItems;
    }

    // Initialize displayed columns
    this._updateDisplayedColumns();

    // Don't load data immediately - wait for view initialization
    // Data will be loaded in ngAfterViewInit
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this._updateDisplayedColumns();
    }

    if (changes['config']) {
      if (this.config?.actionItems?.length) {
        this.actionItems = this.config.actionItems;
      }
      // When config changes (e.g. toggling showCheckbox), recompute displayed columns
      if (this._isViewInitialized) {
        // If checkboxes are being hidden, clear any existing selection so
        // external UIs that depend on selection state don't stay "stuck"
        if (!this.showCheckbox && this.selection.selected.length > 0) {
          this.selection.clear();
          this.selectionChange.emit(this.selection.selected);
        }
        this._updateDisplayedColumns();
      }
    }

    if (!this._isViewInitialized) {
      return;
    }

    if (changes['data']) {
      if (Array.isArray(this.data)) {
        this.dataSource.data = this.data as T[];
        this.error = null;
        this.isLoading = false;
        this.config.totalCount = this.config.totalCount ?? this.data.length;
        this.selection.clear();
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      } else if (this.fetchEndpoint) {
        this.loadData();
      }
    }
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this._isViewInitialized = true;

    // If static data is provided, render it directly; otherwise load from API
    if (Array.isArray(this.data)) {
      this.dataSource.data = this.data as T[];
      this.config.totalCount = this.config.totalCount ?? this.data.length;
    } else if (this.fetchEndpoint) {
      // Defer to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.loadData();
      }, 0);
    }

    // Synchronize paginator with component configuration
    if (this.paginator) {
      this.paginator.pageSize = this.pageSize;
      this.paginator.pageSizeOptions = this.pageSizeOptions;
      this.dataSource.paginator = this.paginator;
    }

    // Set up custom filter predicate for multi-column search
    this.dataSource.filterPredicate = (data: T, filter: string): boolean => {
      if (!filter) return true;

      let filterObj: Record<string, unknown>;

      // Try to parse as JSON filter object (for complex filtering)
      try {
        filterObj = JSON.parse(filter);
      } catch {
        // If not JSON, treat as simple string search
        const searchStr = filter.toLowerCase();
        return this.columns.some(column => {
          const value = this.getValue(data, column);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchStr);
        });
      }

      // Handle JSON filter object
      let matches = true;

      // Apply search filter if present
      if (filterObj['search'] && (filterObj['search'] as string).trim()) {
        const searchStr = (filterObj['search'] as string).toLowerCase();
        const searchMatches = this.columns.some(column => {
          const value = this.getValue(data, column);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchStr);
        });
        matches = matches && searchMatches;
      }

      if (
        filterObj['status'] &&
        (filterObj['status'] as string).trim() &&
        filterObj['status'] !== 'all' &&
        filterObj['status'] !== ''
      ) {
        const statusValue = this.getValue(data, {
          key: 'status'
        } as IColumn<T>);
        let statusMatches = false;
        const filterStatus = (filterObj['status'] as string).toLowerCase();
        if (filterStatus === 'active' || filterStatus === 'inactive') {
          const isActiveValue = this.getValue(data, {
            key: 'isActive'
          } as IColumn<T>);
          if (filterStatus === 'active') {
            statusMatches = isActiveValue === true;
          } else if (filterStatus === 'inactive') {
            statusMatches = isActiveValue === false;
          }
        } else {
          if (statusValue !== null && statusValue !== undefined) {
            let statusStr = '';
            if (typeof statusValue === 'string') {
              statusStr = statusValue.toLowerCase();
            } else if (typeof statusValue === 'number') {
              const map: Record<number, string> = {
                0: 'draft',
                1: 'submitted',
                2: 'approved',
                3: 'rejected',
                4: 'completed'
              };
              statusStr = (map[statusValue] || String(statusValue)).toLowerCase();
            }
            statusMatches = statusStr === filterStatus;
          }
        }
        matches = matches && statusMatches;
      }

      if (
        filterObj['attendancetype'] &&
        (filterObj['attendancetype'] as string).trim() &&
        filterObj['attendancetype'] !== 'all'
      ) {
        const v = this.getValue(data, {
          key: 'attendanceType'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['attendancetype'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (
        filterObj['nextmeal'] &&
        (filterObj['nextmeal'] as string).trim() &&
        filterObj['nextmeal'] !== 'all'
      ) {
        const v = this.getValue(data, {
          key: 'nextMeal'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['nextmeal'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (filterObj['departmentid'] && (filterObj['departmentid'] as string).trim()) {
        const v = this.getValue(data, {
          key: 'departmentId'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['departmentid'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (filterObj['locationid'] && (filterObj['locationid'] as string).trim()) {
        const v = this.getValue(data, {
          key: 'locationId'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['locationid'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (
        filterObj['shiftname'] &&
        (filterObj['shiftname'] as string).trim() &&
        filterObj['shiftname'] !== 'all'
      ) {
        const v = this.getValue(data, {
          key: 'shiftName'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['shiftname'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (filterObj['geofencecode'] && (filterObj['geofencecode'] as string).trim()) {
        const v = this.getValue(data, {
          key: 'geoFenceCode'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['geofencecode'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (filterObj['requesttype'] && (filterObj['requesttype'] as string).trim()) {
        const v = this.getValue(data, {
          key: 'requestType'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['requesttype'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (filterObj['mealtype'] && (filterObj['mealtype'] as string).trim()) {
        const v = this.getValue(data, {
          key: 'mealType'
        } as IColumn<T>);
        const m =
          v && typeof v === 'string'
            ? v.toLowerCase() === (filterObj['mealtype'] as string).toLowerCase()
            : false;
        matches = matches && m;
      }

      if (filterObj['devicetype'] && (filterObj['devicetype'] as string).trim()) {
        const v = this.getValue(data, {
          key: 'deviceType'
        } as IColumn<T>);
        if (v !== null && v !== undefined) {
          const deviceValue = String(v).trim().toUpperCase();
          const filterValue = (filterObj['devicetype'] as string).trim().toUpperCase();
          const m = deviceValue === filterValue;
          matches = matches && m;
        } else {
          matches = false;
        }
      }

      if (
        (filterObj['requesteddatefrom'] && (filterObj['requesteddatefrom'] as string).trim()) ||
        (filterObj['requesteddateto'] && (filterObj['requesteddateto'] as string).trim())
      ) {
        const v = this.getValue(data, {
          key: 'requestedDate'
        } as IColumn<T>);
        let m = true;
        if (v && (typeof v === 'string' || typeof v === 'number')) {
          const d = new Date(v as string);
          if (filterObj['requesteddatefrom']) {
            const from = new Date(filterObj['requesteddatefrom'] as string);
            m = m && d >= from;
          }
          if (filterObj['requesteddateto']) {
            const to = new Date(filterObj['requesteddateto'] as string);
            m = m && d <= to;
          }
        }
        matches = matches && m;
      }

      if (
        (filterObj['eventdatefrom'] && (filterObj['eventdatefrom'] as string).trim()) ||
        (filterObj['eventdateto'] && (filterObj['eventdateto'] as string).trim())
      ) {
        const v = this.getValue(data, {
          key: 'eventDate'
        } as IColumn<T>);
        let m = true;
        if (v && (typeof v === 'string' || typeof v === 'number')) {
          const d = new Date(v as string);
          if (filterObj['eventdatefrom']) {
            const from = new Date(filterObj['eventdatefrom'] as string);
            m = m && d >= from;
          }
          if (filterObj['eventdateto']) {
            const to = new Date(filterObj['eventdateto'] as string);
            m = m && d <= to;
          }
        }
        matches = matches && m;
      }

      return matches;
    };
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // --- Public methods ---
  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  public masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row: T) => this.selection.select(row));
    }
    this.selectionChange.emit(this.selection.selected);
  }

  public onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  public onActionClick(action: string, data: T): void {
    this.actionClick.emit({ action, data });
  }

  public onCheckboxChange(event: { checked?: boolean }, row: T): void {
    if (event.checked !== undefined) {
      this.selection.toggle(row);
      this.selectionChange.emit(this.selection.selected);
    }
  }

  public applyFilter(searchValue: string): void {
    this.searchValue = searchValue;
    const trimmed = searchValue.trim();
    if (trimmed.startsWith('{')) {
      this.dataSource.filter = trimmed;
    } else {
      this.dataSource.filter = trimmed.toLowerCase();
    }
    this.datatableLength.emit(this.dataSource.filteredData.length);
  }

  public refreshData(): void {
    if (!this._isViewInitialized) {
      this._logger.warn('Cannot refresh data - view not initialized yet');
      return;
    }

    // If static data provided, just reapply filter/paginator without calling API
    if (Array.isArray(this.data)) {
      this._logger.debug('Refreshing static datatable data');
      this.dataSource.data = this.data as T[];
      this.error = null;
      this.isLoading = false;
      this.config.totalCount = this.config.totalCount ?? this.data.length;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      return;
    }

    if (!this.fetchEndpoint) {
      this._logger.warn('No fetch endpoint configured for refresh');
      this.error = 'No data source configured';
      return;
    }

    // Prevent multiple simultaneous refresh calls
    if (this.isLoading) {
      this._logger.debug('Refresh already in progress, skipping');
      return;
    }

    this._logger.debug('Refreshing datatable data');
    this.loadData();
  }

  // Load data from API
  public loadData(): void {
    if (!this.fetchEndpoint) {
      this._logger.warn('No fetch endpoint provided for datatable');
      return;
    }

    // Don't cancel existing request, just set loading state
    this.isLoading = true;
    this.error = null;

    // Clear current data and selection
    this.dataSource.data = [];
    this.selection.clear();

    const params: Record<
      string,
      string | number | boolean | readonly (string | number | boolean)[]
    > = {};
    if (this.searchValue && (this.config.sendSearchParam ?? true)) {
      params['search'] = this.searchValue;
    }
    params['pageNumber'] = this.currentPage;
    params['pageSize'] = this.pageSize;

    // Add any additional parameters from config
    if (this.config.parameters) {
      Object.assign(params, this.config.parameters);
    }

    this._logger.debug('Loading data from:', this.fetchEndpoint);
    // eslint-disable-next-line no-console
    console.log('[Datatable] Fetching', this.fetchEndpoint, params);

    const resolvedFetch = this._resolveModuleAndEndpoint(
      this.fetchEndpoint,
      this.config.fetchModule
    );

    this._httpService
      .getRaw<unknown>(resolvedFetch.module, resolvedFetch.endpoint, { params })
      .pipe(
        takeUntil(this._destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: unknown) => {
          try {
            this._logger.debug('API Response received:', response);

            const parsedData = this._parseResponseData(response);
            this.dataSource.data = parsedData;
            const root = response as Record<string, unknown>;
            const pagePayload = root['data'];
            if (pagePayload && typeof pagePayload === 'object' && !Array.isArray(pagePayload)) {
              this._handlePaginationData(pagePayload as Record<string, unknown>);
            } else {
              this._handlePaginationData(root);
            }

            // Honor explicit serverSide configuration if provided
            if (typeof this.config.serverSide === 'boolean') {
              this._useServerPagination = this.config.serverSide;
            }
            if (this._useServerPagination) {
              this.dataSource.paginator = null;
            } else if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }

            this._logger.debug(`Loaded ${parsedData.length} items`);
            // eslint-disable-next-line no-console
            console.log('[Datatable] Loaded items:', parsedData.length);
            this.isLoading = false;
            this.responseReceived.emit(response);
          } catch (parseError) {
            this._logger.error('Error parsing response data:', parseError);
            this.error = 'Failed to parse response data';
            this.dataSource.data = [];
          }
        },
        error: (error: unknown) => {
          this._logger.error('Error loading data:', error);
          const status = (error as { status?: number }).status;
          const message = (error as { error?: { message?: string } }).error?.message;
          this.error = message || 'Failed to load data';
          this.dataSource.data = [];

          // Show user-friendly error message

          if (status === 0) {
            this._snackbarService.showError('Network error. Please check your connection.');
          } else if (status === 400) {
            return;
          } else if ((status ?? 0) >= 500) {
            this._snackbarService.showError('Server error. Please try again later.');
          } else if (status === 404) {
            this._snackbarService.showError('Data not found.');
          } else {
            this._snackbarService.showError(message || 'Failed to load data');
          }
        }
      });
  }

  public editRow(item: T): void {
    // Close any open menu
    this._closeOpenMenus();
    this.editFunction(item);
  }

  public deleteRow(item: T): void {
    // Close any open menu
    this._closeOpenMenus();

    // Show confirmation dialog
    const config: ConfirmationConfig = {
      title: 'Confirm Delete',
      message: this.config.deleteConfirmationText || 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    };

    this._confirmationService.confirm(config).then((result: boolean) => {
      if (result) {
        this._executeDelete(item);
      }
    });
  }

  // Handle custom action
  public handleAction(actionItem: IActionItem<T>, item: T): void {
    // Close any open menu
    this._closeOpenMenus();

    const execute = (): void => {
      if (typeof actionItem.action === 'function') {
        actionItem.action(item);
        if (this.config.autoRefresh) {
          this.refreshData();
        }
      } else {
        this.actionClick.emit({
          action: actionItem.action as string,
          data: item
        });
      }
    };

    if (actionItem.requireConfirmation) {
      const label = this.getActionLabel(actionItem, item);
      const config: ConfirmationConfig = {
        title: actionItem.confirmTitle || `Confirm ${label}`,
        message:
          actionItem.confirmMessage ||
          `Are you sure you want to ${label.toLowerCase()} this record?`,
        confirmText: actionItem.confirmText || 'Confirm',
        cancelText: actionItem.cancelText || 'Cancel',
        type: actionItem.group === 'danger' ? 'danger' : 'info'
      };

      this._confirmationService.confirm(config).then((result: boolean) => {
        if (result) {
          execute();
        }
      });
    } else {
      execute();
    }
  }

  // Check either of the row checkbox is disabled or not
  public isAnyRowDisabled(): boolean {
    return this.dataSource.data.some((row: T) => this.config.disableCheckboxFn?.(row));
  }

  // Check if action should be visible
  public isActionVisible(actionItem: IActionItem<T>, item?: T): boolean {
    return (
      actionItem.show === undefined ||
      actionItem.show === true ||
      (typeof actionItem.show === 'function' && actionItem.show(item))
    );
  }

  // Check if action should be disabled
  public isActionDisabled(actionItem: IActionItem<T>, item?: T): boolean {
    return (
      !!actionItem.disabled &&
      (typeof actionItem.disabled === 'function' ? actionItem.disabled(item) : actionItem.disabled)
    );
  }

  public hasRowActions(item: T): boolean {
    const anyVisible = this.actionItems.some(a => this.isActionVisible(a, item));
    const hasEdit = this.config?.editFunction !== undefined;
    return anyVisible || hasEdit;
  }

  // Get action label on condition
  public getActionLabel(actionItem: IActionItem<T>, item?: T): string {
    if (typeof actionItem.label === 'function') {
      return actionItem.label(item) || '';
    }
    return actionItem.label || '';
  }

  // Get action icon on condition
  public getActionIcon(actionItem: IActionItem<T>, item?: T): string {
    if (typeof actionItem.icon === 'function') {
      return actionItem.icon(item) || 'more_horiz';
    } else if (typeof actionItem.icon === 'string') {
      return actionItem.icon;
    } else {
      // Default icons based on common action types
      const label = this.getActionLabel(actionItem, item);
      if (label.toLowerCase().includes('edit')) return 'edit';
      if (label.toLowerCase().includes('delete')) return 'delete';
      if (label.toLowerCase().includes('view')) return 'visibility';
      if (label.toLowerCase().includes('add')) return 'add';
      if (label.toLowerCase().includes('download')) return 'download';
      if (label.toLowerCase().includes('export')) return 'file_download';
      if (label.toLowerCase().includes('import')) return 'file_upload';
      if (label.toLowerCase().includes('refresh')) return 'refresh';
      if (label.toLowerCase().includes('print')) return 'print';
      if (label.toLowerCase().includes('send')) return 'send';
      if (label.toLowerCase().includes('email')) return 'email';
      if (label.toLowerCase().includes('settings')) return 'settings';
      if (label.toLowerCase().includes('config')) return 'settings';
      if (label.toLowerCase().includes('activate')) return 'check_circle';
      if (label.toLowerCase().includes('deactivate')) return 'cancel';

      // Default icon if no match
      return 'more_horiz';
    }
  }

  // Get action class on condition
  public getActionClass(actionItem: IActionItem<T>, item?: T): string {
    return typeof actionItem.class === 'function'
      ? actionItem.class(item)
      : actionItem.class === 'string'
        ? actionItem.class
        : '';
  }

  // Utility to get cell value for display
  public getValue(item: T, column: IColumn<T>): unknown {
    if (!item || !column) {
      return null;
    }

    // Handle nested property access (e.g., 'uoM.name', 'itemGroup.name')
    let value: unknown = item;
    const keys = column.key.split('.');

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = null;
        break;
      }
    }

    // Apply custom formatting if provided
    if (column.format) {
      return column.format(value);
    }

    return value;
  }

  /** Raw cell value without format (for boolean/icon logic so "No" is not treated as truthy). */
  public getRawValue(item: T, column: IColumn<T>): unknown {
    if (!item || !column) {
      return null;
    }
    let value: unknown = item;
    const keys = column.key.split('.');
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = null;
        break;
      }
    }
    return value;
  }

  /**
   * Whether the raw value should be shown as true for boolean columns
   * (handles boolean and string "true"/"false").
   */
  public isBooleanTrue(value: unknown): boolean {
    return value === true || value === 'true';
  }

  // Helper for template to safely get date value for pipe
  public getDateValue(item: T, column: IColumn<T>): Date | string | null {
    const value = this.getValue(item, column);
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    return null;
  }

  public normalizeImageUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value
      .trim()
      .replace(/^`+|`+$/g, '')
      .replace(/^"+|"+$/g, '')
      .replace(/^'+|'+$/g, '')
      .trim();

    if (!trimmed) return null;
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
    return null;
  }

  public normalizeExternalUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value
      .trim()
      .replace(/^`+|`+$/g, '')
      .replace(/^"+|"+$/g, '')
      .replace(/^'+|'+$/g, '')
      .trim();

    if (!trimmed) return null;
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
    return null;
  }

  // Track function for better performance
  public trackByFn(index: number, item: T): unknown {
    return this._getItemId(item) || index;
  }

  public renderFormComponent(): void {
    this.openForm.emit();
  }

  public onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.config.pageSize = event.pageSize;
    if (this._useServerPagination) {
      if (!this.config.parameters) {
        this.config.parameters = {};
      }
      Object.assign(this.config.parameters, {
        pageSize: event.pageSize,
        pageNumber: event.pageIndex + 1
      });
      this.loadData();
    } else if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    // eslint-disable-next-line no-console
    console.log('[Datatable] Page change', {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  public onSortChange(sort: Sort): void {
    if (this._useServerPagination) {
      if (!this.config.parameters) {
        this.config.parameters = {};
      }
      Object.assign(this.config.parameters, {
        orderBy: sort.active,
        sortDirection: sort.direction
      });
      this.loadData();
      return;
    }
  }

  /**
   * Gets primary actions for a row (non-destructive main actions)
   */
  public getPrimaryActions(): IActionItem<T>[] {
    return this.actionItems.filter(
      action =>
        action.color !== 'warn' && !action.divider && (action.group === 'primary' || !action.group)
    );
  }

  /**
   * Gets secondary actions for a row (additional regular actions)
   */
  public getSecondaryActions(): IActionItem<T>[] {
    return this.actionItems.filter(
      action => action.color !== 'warn' && !action.divider && action.group === 'secondary'
    );
  }

  /**
   * Gets danger actions for a row (destructive actions)
   */
  public getDangerActions(): IActionItem<T>[] {
    return this.actionItems.filter(
      action => (action.color === 'warn' || action.group === 'danger') && !action.divider
    );
  }

  /**
   * Checks if there are any secondary actions
   */
  public hasSecondaryActions(): boolean {
    return this.getSecondaryActions().length > 0;
  }

  /**
   * Checks if there are any danger actions
   */
  public hasDangerActions(): boolean {
    return this.getDangerActions().length > 0;
  }

  /**
   * Gets CSS classes for an action icon
   */
  public getActionIconClass(action: IActionItem<T>, item?: T): string {
    const baseClass = this.getActionClass(action, item);
    let statusClass = '';

    if (action.disabled && typeof action.disabled === 'function' && action.disabled(item)) {
      statusClass = 'inactive-icon';
    } else if (action.disabled === true) {
      statusClass = 'inactive-icon';
    }

    return `${baseClass} ${statusClass}`.trim();
  }

  /**
   * Format status values for better display
   */
  public formatStatus(value: unknown): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    const status = String(value).toLowerCase();

    switch (status) {
      case 'true':
        return 'Active';
      case 'false':
        return 'Inactive';
      case 'loggedin':
        return 'Logged In';
      case 'loggedout':
        return 'Logged Out';
      case 'sessionout':
        return 'Session Out';
      // Stock Status mappings - handle both hyphenated and non-hyphenated formats
      case 'instock':
      case 'in-stock':
        return 'In Stock';
      case 'lowstock':
      case 'low-stock':
        return 'Low Stock';
      case 'outofstock':
      case 'out-of-stock':
        return 'Out of Stock';
      // Add more status mappings as needed
      default:
        // If no specific mapping, capitalize first letter of each word
        return String(value)
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before capital letters
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
    }
  }

  /**
   * Convert status value to CSS class name by replacing spaces with hyphens
   */
  public getStatusClass(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).toString().toLowerCase().replace(/\s+/g, '-');
  }

  // Helper method to get role display for user
  public getRoleDisplay(row: T): string {
    const user = row as Record<string, unknown>;
    if (user && user['roles'] && Array.isArray(user['roles']) && user['roles'].length > 0) {
      const firstRole = user['roles'][0] as Record<string, unknown>;
      return (firstRole['roleName'] as string) || 'No Role';
    }
    return 'No Role';
  }

  /**
   * Check if a location string contains coordinates
   */
  public isCoordinates(location: unknown): boolean {
    if (!location || typeof location !== 'string') {
      return false;
    }
    const coordinatePattern =
      /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    return coordinatePattern.test(location);
  }

  // --- Private methods ---
  private _updateDisplayedColumns(): void {
    // Show checkbox column if enabled
    this.displayedColumns = this.showCheckbox ? ['select'] : [];

    // Add column keys
    this.displayedColumns = [...this.displayedColumns, ...this.columns.map(column => column.key)];

    // Add actions column if enabled
    if (this.showActions) {
      this.displayedColumns.push('actions');
    }
  }

  /**
   * Close all open menu triggers
   */
  private _closeOpenMenus(): void {
    if (this.menuTriggers) {
      this.menuTriggers.forEach(trigger => {
        if (trigger.menuOpen) {
          trigger.closeMenu();
        }
      });
    }
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
    return { module: moduleMatch as ApiModuleEnum, endpoint };
  }

  private _executeDelete(item: T): void {
    if (!this.deleteEndpoint) {
      this._logger.error('Delete endpoint not configured');
      return;
    }

    // Get item ID - assuming item has an 'id' property
    const itemId = this._getItemId(item);
    if (!itemId) {
      this._logger.error('Could not determine item ID for deletion');
      return;
    }

    const endpoint = `${this.deleteEndpoint}/${itemId}`;

    // Optimistic update: temporarily remove item from view
    const originalData = [...this.dataSource.data];
    const itemIndex = this.dataSource.data.findIndex(
      (dataItem: T) => this._getItemId(dataItem) === itemId
    );

    if (itemIndex !== -1) {
      const updatedData = [...this.dataSource.data];
      updatedData.splice(itemIndex, 1);
      this.dataSource.data = updatedData;
    }

    const resolvedDelete = this._resolveModuleAndEndpoint(endpoint, this.config.deleteModule);
    const request = this._httpService.delete(resolvedDelete.module, resolvedDelete.endpoint);

    request.pipe(takeUntil(this._destroy$)).subscribe({
      next: () => {
        // Clear selection if needed
        if (this.selection.isSelected(item)) {
          this.selection.deselect(item);
          this.selectionChange.emit(this.selection.selected);
        }

        // Refresh data to ensure consistency with server
        this.refreshData();

        this._snackbarService.showSuccess('Record has been deleted successfully.');
      },
      error: (error: unknown) => {
        // Revert optimistic update on error
        this.dataSource.data = originalData;

        const typedError = error as {
          error?: { messages?: { error?: string } };
        };
        if (typedError.error && typedError.error.messages) {
          this._snackbarService.showError(
            typedError.error.messages?.error ?? 'Failed to delete record.'
          );
        } else {
          this._snackbarService.showError('Failed to delete record. Please try again.');
        }
        this._logger.error('Error deleting item', error);
      }
    });
  }

  // Utility to get item ID, assuming common property names
  private _getItemId(item: T): string | number | null {
    if (!item) return null;

    // Try common ID property names
    const idProps = ['id', 'ID', 'Id', '_id', 'key', 'uid'];

    for (const prop of idProps) {
      const typedItem = item as Record<string, unknown>;
      if (typedItem[prop] !== undefined) {
        return typedItem[prop] as string | number;
      }
    }

    return null;
  }

  /**
   * Parse API response data into array format
   * Handles multiple response formats with fallback
   */
  private _parseResponseData(response: unknown): T[] {
    // Direct array response
    if (Array.isArray(response)) {
      return response;
    }

    // Object response - check various formats
    if (response && typeof response === 'object') {
      const typedResponse = response as Record<string, unknown>;

      // New format: { data: { items: [] } }
      const data = typedResponse['data'];
      if (data && typeof data === 'object') {
        const items = (data as Record<string, unknown>)['items'];
        if (Array.isArray(items)) {
          // Handle pagination metadata from the data object
          this._handlePaginationData(data as Record<string, unknown>);
          return items as T[];
        }

        const forms = (data as Record<string, unknown>)['forms'];
        if (Array.isArray(forms)) {
          return forms as T[];
        }

        const jobs = (data as Record<string, unknown>)['jobs'];
        if (Array.isArray(jobs)) {
          // Handle pagination metadata from the data object
          this._handlePaginationData(data as Record<string, unknown>);
          return jobs as T[];
        }
      }

      const topData = typedResponse['data'];
      if (Array.isArray(topData)) {
        const first = topData[0] as Record<string, unknown> | undefined;
        if (first && typeof first === 'object') {
          const hasEmployees = Array.isArray((first as Record<string, unknown>)['employees']);
          const hasEmployee = Array.isArray((first as Record<string, unknown>)['employee']);
          if (hasEmployees || hasEmployee) {
            const flattened = (topData as Record<string, unknown>[]).flatMap(d => {
              const e1 = d['employees'] as unknown;
              const e2 = d['employee'] as unknown;
              if (Array.isArray(e1)) return e1 as T[];
              if (Array.isArray(e2)) return e2 as T[];
              return [] as T[];
            });
            return flattened as T[];
          }
        }
      }

      // New format: { data: { body: [] } }
      const nestedData = typedResponse['data'];
      if (nestedData && typeof nestedData === 'object') {
        const nestedBody = (nestedData as Record<string, unknown>)['body'];
        if (Array.isArray(nestedBody)) {
          // Handle pagination metadata
          this._handlePaginationData(nestedData as Record<string, unknown>);
          return nestedBody as T[];
        }
        const nestedItems = (nestedData as Record<string, unknown>)['data'];
        if (Array.isArray(nestedItems)) {
          this._handlePaginationData(nestedData as Record<string, unknown>);
          return nestedItems as T[];
        }
      }

      // Legacy format: { data: [] }
      if (Array.isArray(typedResponse['data'])) {
        return typedResponse['data'] as T[];
      }

      if (
        Object.prototype.hasOwnProperty.call(typedResponse, 'data') &&
        typedResponse['data'] === null
      ) {
        return [];
      }

      // Legacy format: { items: [] }
      if (Array.isArray(typedResponse['items'])) {
        return typedResponse['items'] as T[];
      }
      if (
        Object.prototype.hasOwnProperty.call(typedResponse, 'items') &&
        typedResponse['items'] === null
      ) {
        return [];
      }

      // Fallback: look for any array property
      const arrayProperty = Object.values(typedResponse).find(value => Array.isArray(value));
      if (arrayProperty) {
        this._logger.warn('Using fallback array property for response data', response);
        return arrayProperty as T[];
      }
    }

    // No valid data found
    this._logger.warn('No valid array data found in response', response);
    return [];
  }

  /**
   * Handle pagination metadata from API response
   */
  private _handlePaginationData(data: Record<string, unknown>): void {
    // New format: { data: { items: [...], currentPage: 1, totalPages: 1, totalCount: 1, ... } }
    const currentPageVal = data['currentPage'];
    const pageSizeVal = data['pageSize'];
    const totalCountVal = data['totalCount'];

    if (
      typeof currentPageVal === 'number' &&
      typeof pageSizeVal === 'number' &&
      typeof totalCountVal === 'number'
    ) {
      if (!this.config.parameters) {
        this.config.parameters = {} as Record<string, unknown>;
      }
      Object.assign(this.config.parameters, {
        pageSize: pageSizeVal,
        pageNumber: currentPageVal
      });
      this.currentPage = currentPageVal as number;
      this.config.pageSize = pageSizeVal as number;
      this.config.totalCount = totalCountVal as number;
      this._useServerPagination = true;
      return;
    }

    const pagination = data['pagination'];
    if (pagination && typeof pagination === 'object') {
      const typedPagination = pagination as IPaginationResponse;

      if (!this.config.parameters) {
        this.config.parameters = {};
      }

      Object.assign(this.config.parameters, {
        pageSize: typedPagination.pageSize,
        pageNumber: typedPagination.currentPage
      });

      this.currentPage = typedPagination.currentPage;
      this.config.totalCount = typedPagination.totalCount;
      this._useServerPagination = true;
      return;
    }

    const totalCountKeys = ['totalCount', 'total', 'count'];
    for (const key of totalCountKeys) {
      const val = data[key as keyof typeof data] as unknown;
      if (typeof val === 'number') {
        this.config.totalCount = val;
        this._useServerPagination = false;
        return;
      }
    }

    const meta = data['meta'];
    if (meta && typeof meta === 'object') {
      const typedMeta = meta as Record<string, unknown>;
      const metaPagination = typedMeta['pagination'];
      if (metaPagination && typeof metaPagination === 'object') {
        const p = metaPagination as IPaginationResponse;
        if (!this.config.parameters) {
          this.config.parameters = {};
        }
        Object.assign(this.config.parameters, {
          pageSize: p.pageSize,
          pageNumber: p.currentPage
        });
        this.currentPage = p.currentPage;
        this.config.pageSize = p.pageSize;
        this.config.totalCount = p.totalCount;
        this._useServerPagination = true;
        return;
      }
      const metaTotal =
        (typedMeta['total'] as number) ??
        (typedMeta['count'] as number) ??
        (typedMeta['totalCount'] as number);
      if (typeof metaTotal === 'number') {
        this.config.totalCount = metaTotal;
        this._useServerPagination = false;
        return;
      }
    }
  }
}
