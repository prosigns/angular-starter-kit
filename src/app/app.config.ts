import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  withRouterConfig
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { CustomPreloadingStrategy } from './core/strategies/custom-preloading.strategy';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { AuthService } from './core/services/auth.service';

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initializeApp(authService: AuthService) {
  return () => authService.initAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(CustomPreloadingStrategy),
      withRouterConfig({ paramsInheritanceStrategy: 'always' })
    ),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideClientHydration(),
    provideEnvironmentNgxMask(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAppInitializer(() => {
      const initializerFn = initializeApp(inject(AuthService));
      return initializerFn();
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        },
        defaultLanguage: 'en'
      })
    )
  ]
};
