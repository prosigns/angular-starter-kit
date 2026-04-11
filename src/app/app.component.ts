import { Component, OnInit, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';

import { ToastComponent } from './shared/components/toast/toast.component';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private readonly _translateService = inject(TranslateService);
  private readonly _themeService = inject(ThemeService);
  private readonly _platformId = inject(PLATFORM_ID);

  public ngOnInit(): void {
    // Initialize translation
    this._translateService.setDefaultLang('en');
    if (isPlatformBrowser(this._platformId)) {
      this._translateService.use(localStorage.getItem('lang') || 'en');
    }

    // Initialize theme
    this._themeService.initializeTheme();
  }
}
