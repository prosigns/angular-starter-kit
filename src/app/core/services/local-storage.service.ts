import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly _prefix = 'caretrack-';

  constructor() {
    this._checkStorageAvailability();
  }

  public setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this._prefix + key, serializedValue);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting localStorage item:', error);
      return false;
    }
  }

  public getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this._prefix + key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  public removeItem(key: string): boolean {
    try {
      localStorage.removeItem(this._prefix + key);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error removing localStorage item:', error);
      return false;
    }
  }

  public clear(): boolean {
    try {
      const keys = this.getKeys();
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  public getKeys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this._prefix)) {
          keys.push(key);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting localStorage keys:', error);
    }
    return keys;
  }

  public getAppKeys(): string[] {
    return this.getKeys().map(key => key.replace(this._prefix, ''));
  }

  public hasItem(key: string): boolean {
    try {
      return localStorage.getItem(this._prefix + key) !== null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking localStorage item:', error);
      return false;
    }
  }

  public getStorageSize(): number {
    let total = 0;
    try {
      for (const key in localStorage) {
        if (
          Object.prototype.hasOwnProperty.call(localStorage, key) &&
          key.startsWith(this._prefix)
        ) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating storage size:', error);
    }
    return total;
  }

  public setItemWithExpiry<T>(key: string, value: T, expiryInMinutes: number): boolean {
    try {
      const now = new Date();
      const item = {
        value: value,
        expiry: now.getTime() + expiryInMinutes * 60 * 1000
      };
      return this.setItem(key, item);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting localStorage item with expiry:', error);
      return false;
    }
  }

  public getItemWithExpiry<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this._prefix + key);
      if (!itemStr) {
        return null;
      }

      const item = JSON.parse(itemStr);
      const now = new Date();

      if (now.getTime() > item.expiry) {
        this.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting localStorage item with expiry:', error);
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
      console.error('Error updating localStorage item:', error);
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
      console.error('Error setting multiple localStorage items:', error);
      return false;
    }
  }

  private _checkStorageAvailability(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('localStorage is not available:', e);
      return false;
    }
  }
}
