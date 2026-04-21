/**
 * Response from admin/objectmanager/columns API
 */
export interface IColumnDefinitionResponse {
  statusCode: number;
  success: boolean;
  messages: {
    success: string;
  };
  data: {
    entityType: string;
    columns: IColumnDefinition[];
  };
  timestamp: string;
}

/**
 * Individual column definition from the API
 */
export interface IColumnDefinition {
  name: string;
  label: string;
  dataType: string;
  isCustomField: boolean;
}

/**
 * Mapping of API data types to component column types
 */
export const DATA_TYPE_MAPPING: Record<
  string,
  'text' | 'date' | 'email' | 'link' | 'status' | 'owner' | 'custom' | 'location'
> = {
  nvarchar: 'text',
  varchar: 'text',
  text: 'text',
  uniqueidentifier: 'text',
  int: 'text', // Numbers displayed as text but can be formatted
  bigint: 'text',
  decimal: 'text',
  float: 'text',
  bit: 'text', // Boolean displayed as text (Yes/No)
  datetime: 'date',
  datetime2: 'date',
  date: 'date',
  time: 'text'
};
