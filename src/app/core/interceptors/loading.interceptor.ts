import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  // Skip loading for certain requests (like silent token refresh)
  const skipLoading = req.headers.has('X-Skip-Loading');

  if (!skipLoading) {
    loaderService.startLoading();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoading) {
        loaderService.endLoading();
      }
    })
  );
};
