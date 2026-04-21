import { Directive, ViewContainerRef, OnInit, OnDestroy, inject } from '@angular/core';
import { DynamicDialogService } from './dynamic-dialog.service';

@Directive({
  selector: '[appDynamicDialogHost]',
  standalone: true
})
export class DynamicDialogHostDirective implements OnInit, OnDestroy {
  private _viewContainerRef = inject(ViewContainerRef);
  private _dynamicDialogService = inject(DynamicDialogService);

  public ngOnInit(): void {
    this._dynamicDialogService.setViewContainerRef(this._viewContainerRef);
  }

  public ngOnDestroy(): void {
    // Clean up any open dialogs when the host is destroyed
    this._dynamicDialogService.closeAll();
  }
}
