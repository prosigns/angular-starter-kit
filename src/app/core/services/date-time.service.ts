import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateTimeService {
  public formatDate(date?: string | Date, timeZone = 'Asia/Karachi'): string {
    const d = typeof date === 'string' ? new Date(date) : date || new Date();
    return this._formatDateInTimeZone(d, timeZone);
  }

  public formatDateTime(date?: string | Date, timeZone = 'Asia/Karachi'): string {
    const d = typeof date === 'string' ? new Date(date) : date || new Date();
    const datePart = this._formatDateInTimeZone(d, timeZone);
    const timePart = this._formatTimeInTimeZone(d, timeZone);
    return `${datePart}T${timePart}`;
  }

  public getCurrentDate(timeZone = 'Asia/Karachi'): string {
    return this.formatDate(new Date(), timeZone);
  }

  public getCurrentTime(timeZone = 'Asia/Karachi'): string {
    return this._formatTimeInTimeZone(new Date(), timeZone);
  }

  public getCurrentDateTime(timeZone = 'Asia/Karachi'): string {
    return this.formatDateTime(new Date(), timeZone);
  }

  private _formatDateInTimeZone(d: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const y = parts.find(p => p.type === 'year')?.value || '';
    const m = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    return `${y}-${m}-${day}`;
  }

  private _formatTimeInTimeZone(d: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).formatToParts(d);
    const hh = parts.find(p => p.type === 'hour')?.value || '00';
    const mm = parts.find(p => p.type === 'minute')?.value || '00';
    const ss = parts.find(p => p.type === 'second')?.value || '00';
    return `${hh}:${mm}:${ss}`;
  }
}
