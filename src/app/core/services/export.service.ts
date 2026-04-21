import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { LoggingService } from '../../core/services/logging.service';

export interface IExportColumn {
  key: string;
  header: string;
  transform?: (value: unknown) => string;
}

export interface IExportOptions {
  filename?: string;
  columns?: IExportColumn[];
  includeHeaders?: boolean;
  dateFormat?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private _toastService = inject(ToastService);
  private _logger = inject(LoggingService);

  public exportToCSV<T>(data: T[], options: IExportOptions = {}): void {
    try {
      this._logger.debug('ExportService: Starting CSV export', {
        dataCount: data.length,
        options
      });

      if (!data || data.length === 0) {
        this._toastService.showWarning('No data available to export');
        return;
      }

      const {
        filename = 'export',
        columns,
        includeHeaders = true,
        dateFormat = 'yyyy-MM-dd HH:mm:ss'
      } = options;

      const exportColumns = columns || this._generateColumnsFromData(data[0]);

      let csvContent = '';

      if (includeHeaders) {
        const headers = exportColumns.map(col => this._escapeCSVValue(col.header));
        csvContent += headers.join(',') + '\n';
      }

      data.forEach(item => {
        const row = exportColumns.map(col => {
          let value = this._getNestedValue(item as Record<string, unknown>, col.key);

          if (col.transform) {
            value = col.transform(value);
          } else if (value instanceof Date) {
            value = this._formatDate(value, dateFormat);
          } else if (value === null || value === undefined) {
            value = '';
          }

          return this._escapeCSVValue(String(value));
        });

        csvContent += row.join(',') + '\n';
      });

      this._downloadFile(csvContent, `${filename}.csv`, 'text/csv');

      this._toastService.showSuccess(
        `Successfully exported ${data.length} records to ${filename}.csv`
      );
      this._logger.info('ExportService: CSV export completed successfully', {
        filename: `${filename}.csv`,
        recordCount: data.length
      });
    } catch (error) {
      this._logger.error('ExportService: Error during CSV export', error);
      this._toastService.showError('Failed to export data. Please try again.');
    }
  }

  public exportToJSON<T>(data: T[], filename = 'export'): void {
    try {
      this._logger.debug('ExportService: Starting JSON export', {
        dataCount: data.length
      });

      if (!data || data.length === 0) {
        this._toastService.showWarning('No data available to export');
        return;
      }

      const jsonContent = JSON.stringify(data, null, 2);
      this._downloadFile(jsonContent, `${filename}.json`, 'application/json');

      this._toastService.showSuccess(
        `Successfully exported ${data.length} records to ${filename}.json`
      );
      this._logger.info('ExportService: JSON export completed successfully', {
        filename: `${filename}.json`,
        recordCount: data.length
      });
    } catch (error) {
      this._logger.error('ExportService: Error during JSON export', error);
      this._toastService.showError('Failed to export data. Please try again.');
    }
  }

  private _generateColumnsFromData(dataItem: unknown): IExportColumn[] {
    if (!dataItem) return [];

    return Object.keys(dataItem).map(key => ({
      key,
      header: this._formatHeader(key)
    }));
  }

  private _formatHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private _getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (current && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  private _escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private _formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('yyyy', String(year))
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  private _downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }
}
