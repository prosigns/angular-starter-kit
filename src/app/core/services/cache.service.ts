import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

interface ICacheEntry<T = unknown> {
  response: HttpResponse<T>;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private _cache = new Map<string, ICacheEntry>();
  private readonly _defaultTtl = 5 * 60 * 1000;

  public set<T = unknown>(
    url: string,
    response: HttpResponse<T>,
    ttl: number = this._defaultTtl
  ): void {
    const entry: ICacheEntry = {
      response: response.clone(),
      timestamp: Date.now(),
      ttl
    };

    this._cache.set(url, entry);
    this._cleanupExpired();
  }

  public get<T = unknown>(url: string): HttpResponse<T> | null {
    const entry = this._cache.get(url);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this._cache.delete(url);
      return null;
    }

    return entry.response.clone() as HttpResponse<T>;
  }

  public delete(url: string): void {
    this._cache.delete(url);
  }

  public clear(): void {
    this._cache.clear();
  }

  public invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this._cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this._cache.delete(key));
  }

  public getCacheSize(): number {
    return this._cache.size;
  }

  public getCacheInfo(): {
    size: number;
    entries: { url: string; age: number; ttl: number }[];
  } {
    const now = Date.now();
    const entries = Array.from(this._cache.entries()).map(([url, entry]) => ({
      url,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }));

    return {
      size: this._cache.size,
      entries
    };
  }

  private _cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this._cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this._cache.delete(key));
  }
}
