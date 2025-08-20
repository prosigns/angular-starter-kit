import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
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

  public ngOnInit(): void {
    // Initialize translation
    this._translateService.setDefaultLang('en');
    this._translateService.use(localStorage.getItem('lang') || 'en');

    // Initialize theme
    this._themeService.initializeTheme();
  }
}
