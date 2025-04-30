import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // Signals for reactive approach
  readonly isLoading = signal<boolean>(false);
  readonly loadingMessage = signal<string>('Loading...');
  
  private activeRequests = 0;
  
  /**
   * Start loading state with an optional custom message
   */
  startLoading(message?: string): void {
    this.activeRequests++;
    this.isLoading.set(true);
    
    if (message) {
      this.loadingMessage.set(message);
    }
  }
  
  /**
   * End loading state
   */
  endLoading(): void {
    this.activeRequests--;
    
    // Only set loading to false when all active requests are finished
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.isLoading.set(false);
      this.resetMessage();
    }
  }
  
  /**
   * Update the loading message while loading is in progress
   */
  updateMessage(message: string): void {
    if (this.isLoading()) {
      this.loadingMessage.set(message);
    }
  }
  
  /**
   * Reset the loading message to default
   */
  private resetMessage(): void {
    this.loadingMessage.set('Loading...');
  }
} 