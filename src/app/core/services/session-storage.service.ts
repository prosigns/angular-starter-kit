import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly _prefix = 'caretrack-session-';

  constructor() {
    this._checkStorageAvailability();
  }

  public setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(this._prefix + key, serializedValue);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting sessionStorage item:', error);
      return false;
    }
  }

  public getItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this._prefix + key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting sessionStorage item:', error);
      return null;
    }
  }

  public removeItem(key: string): boolean {
    try {
      sessionStorage.removeItem(this._prefix + key);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error removing sessionStorage item:', error);
      return false;
    }
  }

  public clear(): boolean {
    try {
      const keys = this.getKeys();
      keys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }

  public getKeys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this._prefix)) {
          keys.push(key);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting sessionStorage keys:', error);
    }
    return keys;
  }

  public getAppKeys(): string[] {
    return this.getKeys().map(key => key.replace(this._prefix, ''));
  }

  public hasItem(key: string): boolean {
    try {
      return sessionStorage.getItem(this._prefix + key) !== null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking sessionStorage item:', error);
      return false;
    }
  }

  public getStorageSize(): number {
    let total = 0;
    try {
      for (const key in sessionStorage) {
        if (
          Object.prototype.hasOwnProperty.call(sessionStorage, key) &&
          key.startsWith(this._prefix)
        ) {
          total += sessionStorage[key].length + key.length;
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating storage size:', error);
    }
    return total;
  }

  public setItemWithTimestamp<T>(key: string, value: T): boolean {
    try {
      const item = {
        value: value,
        timestamp: new Date().getTime()
      };
      return this.setItem(key, item);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting sessionStorage item with timestamp:', error);
      return false;
    }
  }

  public getItemWithTimestamp<T>(key: string): { value: T; timestamp: number } | null {
    try {
      const item = this.getItem<{ value: T; timestamp: number }>(key);
      return item;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting sessionStorage item with timestamp:', error);
      return null;
    }
  }

  public updateItem<T>(key: string, updateFn: (currentValue: T | null) => T): boolean {
    try {
      const currentValue = this.getItem<T>(key);
      const newValue = updateFn(currentValue);
      return this.setItem(key, newValue);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating sessionStorage item:', error);
      return false;
    }
  }

  public getMultipleItems<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.getItem<T>(key);
    });
    return result;
  }

  public setMultipleItems<T>(items: Record<string, T>): boolean {
    try {
      Object.entries(items).forEach(([key, value]) => {
        this.setItem(key, value);
      });
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting multiple sessionStorage items:', error);
      return false;
    }
  }

  public getItemAge(key: string): number | null {
    try {
      const item = this.getItemWithTimestamp(key);
      if (!item) {
        return null;
      }
      const now = new Date().getTime();
      return Math.floor((now - item.timestamp) / (1000 * 60));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting item age:', error);
      return null;
    }
  }

  public removeOldItems(maxAgeInMinutes: number): number {
    let removedCount = 0;
    try {
      const keys = this.getAppKeys();
      keys.forEach(key => {
        const age = this.getItemAge(key);
        if (age !== null && age > maxAgeInMinutes) {
          this.removeItem(key);
          removedCount++;
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error removing old items:', error);
    }
    return removedCount;
  }

  private _checkStorageAvailability(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('sessionStorage is not available:', e);
      return false;
    }
  }
}
