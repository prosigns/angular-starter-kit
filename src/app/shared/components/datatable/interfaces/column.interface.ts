import { TemplateRef } from '@angular/core';

/**
 * Configuration for link columns that should navigate internally
 */
export interface ILinkConfig {
  /** The module/route path (e.g., 'sales/leads', 'sales/contacts') */
  routePath: string;
  /** Whether to open in new tab/window (default: false for internal links) */
  external?: boolean;
  /** Custom link text (if not provided, shows the value) */
  linkText?: string;
  /** Icon to show next to the link */
  icon?: string;
  /** Tooltip text for the link */
  tooltip?: string;
}

/**
 * Defines the structure of a column in the datatable
 */
export interface IColumn<T> {
  key: string;
  title: string;
  type?:
    | 'text'
    | 'date'
    | 'datetime'
    | 'email'
    | 'phone'
    | 'mobile'
    | 'link'
    | 'status'
    | 'custom'
    | 'owner'
    | 'location'
    | 'rating'
    | 'indicator'
    | 'currency'
    | 'boolean'
    | 'role'
    | 'image';
  sortable?: boolean;
  disabled?: boolean;
  format?: (value: unknown) => string;
  width?: string;
  customTemplate?: TemplateRef<{ $implicit: T; column: IColumn<T> }>;
  requireConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: string;
  color?: string;
  hideAvatar?: boolean;
  maxRating?: number;
  allowHalfStars?: boolean;
  /**
   * Enable copy-to-clipboard functionality for this column
   * (automatically enabled for email, phone, mobile types)
   */
  enableCopy?: boolean;
  /** Custom copy message displayed in tooltip */
  copyMessage?: string;
  /** Configuration for link columns - enables internal routing */
  linkConfig?: ILinkConfig;
  /** Currency formatting options for currency type columns */
  currencyFormat?: ICurrencyFormatOptions;
  transform?: (value: unknown) => unknown;
  /**
   * When true, cell text wraps within the column
   * (use with config.variableRowHeight for multi-line rows).
   */
  wrapText?: boolean;
}

export interface ICurrencyFormatOptions {
  /** Enable color coding for positive/negative values */
  colorCoding?: boolean;
  /** Use compact notation for large numbers (e.g., 1.2M) */
  useCompactNotation?: boolean;
  /** Use accounting format for negative numbers (parentheses) */
  useAccountingFormat?: boolean;
  /** Custom color for positive values */
  positiveColor?: string;
  /** Custom color for negative values */
  negativeColor?: string;
  /** Compact notation threshold (default: 1,000,000) */
  compactThreshold?: number;
}
