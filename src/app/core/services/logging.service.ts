import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
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
  private readonly API_URL = `${environment.apiUrl}/logs`;
  private lastErrorId: string | null = null;

  constructor(private http: HttpClient) {}

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  fatal(message: string, data?: any): void {
    this.log(LogLevel.FATAL, message, data);
  }

  logError(message: string, error?: any): string {
    const errorId = this.generateErrorId();
    this.lastErrorId = errorId;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      data: error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId
    };

    // Only send to server in production
    if (environment.production) {
      this.sendToServer(logEntry).subscribe();
    }

    // Always log to console in development
    if (!environment.production) {
      console.error(`[ERROR] ${message}`, error);
    }

    return errorId;
  }

  getLastErrorId(): string | null {
    return this.lastErrorId;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Only send INFO and higher to server in production
    if (
      environment.production &&
      (level === LogLevel.INFO ||
        level === LogLevel.WARN ||
        level === LogLevel.ERROR ||
        level === LogLevel.FATAL)
    ) {
      this.sendToServer(logEntry).subscribe();
    }

    // Always log to console in development
    if (!environment.production) {
      this.logToConsole(logEntry);
    }
  }

  private sendToServer(logEntry: LogEntry): Observable<any> {
    return this.http.post(`${this.API_URL}`, logEntry).pipe(
      catchError(error => {
        // Fallback to console if server logging fails
        console.error('Failed to send log to server:', error);
        this.logToConsole(logEntry);
        return of(null);
      })
    );
  }

  private logToConsole(logEntry: LogEntry): void {
    const { level, message, data } = logEntry;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[DEBUG] ${message}`, data);
        break;
      case LogLevel.INFO:
        console.info(`[INFO] ${message}`, data);
        break;
      case LogLevel.WARN:
        console.warn(`[WARN] ${message}`, data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`[${level}] ${message}`, data);
        break;
    }
  }

  private generateErrorId(): string {
    // Generate a random ID for error tracking
    return 'err_' + Math.random().toString(36).substring(2, 15);
  }
}
