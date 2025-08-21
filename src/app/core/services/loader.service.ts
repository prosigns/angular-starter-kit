import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // Signals for reactive approach
  public readonly isLoading = signal<boolean>(false);
  public readonly loadingMessage = signal<string>('Loading...');

  private _activeRequests = 0;

  /**
   * Start loading state with an optional custom message
   */
  public startLoading(message?: string): void {
    this._activeRequests++;
    this.isLoading.set(true);

    if (message) {
      this.loadingMessage.set(message);
    }
  }

  /**
   * End loading state
   */
  public endLoading(): void {
    this._activeRequests--;

    // Only set loading to false when all active requests are finished
    if (this._activeRequests <= 0) {
      this._activeRequests = 0;
      this.isLoading.set(false);
      this._resetMessage();
    }
  }

  /**
   * Update the loading message while loading is in progress
   */
  public updateMessage(message: string): void {
    if (this.isLoading()) {
      this.loadingMessage.set(message);
    }
  }

  /**
   * Reset the loading message to default
   */
  private _resetMessage(): void {
    this.loadingMessage.set('Loading...');
  }
}
