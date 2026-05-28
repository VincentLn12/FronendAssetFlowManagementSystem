import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { AccountService } from './core/services/account.service';
import { catchError, of, switchMap } from 'rxjs';
import { provideFlatpickrDefaults } from 'angularx-flatpickr';

export function initializeApp(accountService: AccountService) {
  return () =>
    accountService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth.isAuthenticated) {
          return accountService.getUserInfo();
        }
        return of(null);
      }),
      catchError(() => of(null)),
    );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFlatpickrDefaults(),
    provideHttpClient(withInterceptors([errorInterceptor, loadingInterceptor, authInterceptor])),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { autoFocus: 'dialog', restoreFocus: true },
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [AccountService],
    },
  ],
};
