import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppUpdateInfo, OfflineService } from '../../../core/services/offline.service';

@Component({
  selector: 'app-update-notifier',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="update-fab-shell" *ngIf="isVisible">
      <button class="update-fab" (click)="toggleExpanded()">
        <span class="pulse-dot"></span>
        <span>Update</span>
      </button>

      <div class="update-card" *ngIf="isExpanded">
        <div class="title-row">
          <h4>Update ready</h4>
          <button class="icon-btn" (click)="close()" aria-label="Close update panel">x</button>
        </div>

        <p class="subtitle">Reload now or clear stale cache.</p>

        <div class="version-row" *ngIf="updateInfo">
          <span>{{ updateInfo.currentVersion }}</span>
          <span class="arrow">-></span>
          <span>{{ updateInfo.latestVersion }}</span>
        </div>

        <div class="action-row">
          <button class="btn btn-secondary" (click)="later()">Later</button>
          <button class="btn btn-tertiary" (click)="clearAndReload()">Clear cache</button>
          <button class="btn btn-primary" (click)="updateNow()">Update now</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .update-fab-shell {
        position: fixed;
        left: 20px;
        bottom: 20px;
        z-index: 1200;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .update-fab {
        border: 0;
        border-radius: 999px;
        padding: 8px 12px;
        background: linear-gradient(135deg, #0f172a, #1d4ed8);
        color: #fff;
        font-weight: 600;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
      }

      .update-fab:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 36px rgba(15, 23, 42, 0.45);
      }

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 0 rgba(34, 197, 94, 0.7);
        animation: pulse 1.6s infinite;
      }

      .update-card {
        width: min(300px, calc(100vw - 32px));
        border-radius: 16px;
        padding: 10px;
        color: #0f172a;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(148, 163, 184, 0.3);
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
        animation: slideUp 0.25s ease;
      }

      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .title-row h4 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
      }

      .icon-btn {
        border: 0;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #e2e8f0;
        color: #334155;
        cursor: pointer;
        line-height: 1;
        font-size: 12px;
      }

      .subtitle {
        margin: 0;
        color: #475569;
        font-size: 12px;
      }

      .version-row {
        margin-top: 8px;
        margin-bottom: 10px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #1e3a8a;
        background: #dbeafe;
        border-radius: 999px;
        padding: 4px 8px;
      }

      .arrow {
        color: #2563eb;
        font-weight: 700;
      }

      .action-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .btn {
        border: 0;
        border-radius: 9px;
        padding: 6px 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.15s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
      }

      .btn-primary {
        background: #2563eb;
        color: #fff;
        margin-left: auto;
      }

      .btn-secondary {
        background: #e2e8f0;
        color: #334155;
      }

      .btn-tertiary {
        background: #fee2e2;
        color: #991b1b;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
        }
        70% {
          box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `
  ]
})
export class UpdateNotifierComponent implements OnInit, OnDestroy {
  public isVisible = false;
  public isExpanded = true;
  public updateInfo: AppUpdateInfo | null = null;

  private _offlineService = inject(OfflineService);
  private _destroy$ = new Subject<void>();

  public ngOnInit(): void {
    this._offlineService.updateAvailable$.pipe(takeUntil(this._destroy$)).subscribe(available => {
      this.isVisible = available;
      if (available) {
        this.isExpanded = true;
      }
    });

    this._offlineService.updateInfo$.pipe(takeUntil(this._destroy$)).subscribe(info => {
      this.updateInfo = info;
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  public close(): void {
    this.isExpanded = false;
  }

  public later(): void {
    this._offlineService.dismissUpdateNotification();
  }

  public async updateNow(): Promise<void> {
    await this._offlineService.applyUpdate();
  }

  public async clearAndReload(): Promise<void> {
    await this._offlineService.clearCacheAndReload();
  }
}
