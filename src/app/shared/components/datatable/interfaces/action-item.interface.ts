/**
 * Defines an action item for the datatable row actions menu or header actions
 */
export interface IActionItem<T> {
  label: string | ((item?: T) => string);
  icon?: string | ((item?: T) => string);
  action: (item?: T) => void;
  color?: string;
  disabled?: boolean | ((item?: T) => boolean);
  class?: string | ((item?: T) => string);
  show?: boolean | ((item?: T) => boolean);
  divider?: boolean;
  requireConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: string;
  tooltip?: string;
  /** Groups actions into primary, secondary, or danger categories */
  group?: 'primary' | 'secondary' | 'danger';
  /** Optional description text for the action */
  description?: string;
}
