import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export enum LogLevelEnum {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface ILogEntry {
  timestamp: string;
  level: LogLevelEnum;
  message: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  errorId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly _apiUrl = `${environment.apiUrl}/logs`;
  private _lastErrorId: string | null = null;

  private readonly _http = inject(HttpClient);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _isBrowser = isPlatformBrowser(this._platformId);

  public debug(message: string, data?: unknown): void {
    this._log(LogLevelEnum.DEBUG, message, data);
  }

  public info(message: string, data?: unknown): void {
    this._log(LogLevelEnum.INFO, message, data);
  }

  public warn(message: string, data?: unknown): void {
    this._log(LogLevelEnum.WARN, message, data);
  }

  public error(message: string, data?: unknown): void {
    this._log(LogLevelEnum.ERROR, message, data);
  }

  public fatal(message: string, data?: unknown): void {
    this._log(LogLevelEnum.FATAL, message, data);
  }

  public logError(message: string, error?: unknown): string {
    const errorId = this._generateErrorId();
    this._lastErrorId = errorId;

    const logEntry: ILogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevelEnum.ERROR,
      message,
      data: error,
      url: this._isBrowser ? window.location.href : '',
      userAgent: this._isBrowser ? navigator.userAgent : '',
      errorId
    };

    // Only send to server in production
    if (environment.production) {
      this._sendToServer(logEntry).subscribe();
    }

    // Always log to console in development
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, error);
    }

    return errorId;
  }

  public getLastErrorId(): string | null {
    return this._lastErrorId;
  }

  private _log(level: LogLevelEnum, message: string, data?: unknown): void {
    const logEntry: ILogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: this._isBrowser ? window.location.href : '',
      userAgent: this._isBrowser ? navigator.userAgent : ''
    };

    // Only send INFO and higher to server in production
    if (
      environment.production &&
      (level === LogLevelEnum.INFO ||
        level === LogLevelEnum.WARN ||
        level === LogLevelEnum.ERROR ||
        level === LogLevelEnum.FATAL)
    ) {
      this._sendToServer(logEntry).subscribe();
    }

    // Always log to console in development
    if (!environment.production) {
      this._logToConsole(logEntry);
    }
  }

  private _sendToServer(logEntry: ILogEntry): Observable<unknown> {
    return this._http.post(`${this._apiUrl}`, logEntry).pipe(
      catchError(error => {
        // Fallback to console if server logging fails
        // eslint-disable-next-line no-console
        console.error('Failed to send log to server:', error);
        this._logToConsole(logEntry);
        return of(null);
      })
    );
  }

  private _logToConsole(logEntry: ILogEntry): void {
    const { level, message, data } = logEntry;
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();

    switch (level) {
      case LogLevelEnum.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(`[${timestamp}] DEBUG: ${message}`, data);
        break;
      case LogLevelEnum.INFO:
        // eslint-disable-next-line no-console
        console.info(`[${timestamp}] INFO: ${message}`, data);
        break;
      case LogLevelEnum.WARN:
        // eslint-disable-next-line no-console
        console.warn(`[${timestamp}] WARN: ${message}`, data);
        break;
      case LogLevelEnum.ERROR:
      case LogLevelEnum.FATAL:
        // eslint-disable-next-line no-console
        console.error(`[${timestamp}] ${level}: ${message}`, data);
        break;
    }
  }

  private _generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
