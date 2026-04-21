import { IActionItem } from './action-item.interface';
import { IEmptyStateConfig } from './empty-state-config.interface';
import { ApiModuleEnum } from '../../../../core/enums/api-modules.enum';

/**
 * Configuration options for the datatable component
 */
export interface ITableConfig<T> {
  showCheckbox?: boolean;
  showSearch?: boolean;
  showPaginator?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showActions?: boolean;
  showTotalCount?: boolean; // Whether to show the total records count
  showCreateButton?: boolean; // Whether to show the create button in empty state
  actionItems?: IActionItem<T>[];
  headerActions?: IActionItem<T>[];
  emptyStateConfig?: IEmptyStateConfig;
  fetchEndPoint?: string;
  fetchModule?: ApiModuleEnum;
  deleteEndPoint?: string;
  deleteModule?: ApiModuleEnum;
  updateEndPoint?: string;
  updateModule?: ApiModuleEnum;

  /**
   * Object type for fetching column definitions from admin/objectmanager/columns
   * If provided, columns will be fetched from API instead of generated from data
   */
  objectType?: string;

  /**
   * Pagination and sorting parameters used when fetching data from API
   * These will be automatically added to the request parameters
   */
  pageNumber?: number;
  orderBy?: string;
  sortDirection?: boolean; // false = ascending, true = descending
  enableCache?: boolean;

  parameters?: Record<string, unknown>;
  showColumnFilter?: boolean;
}
