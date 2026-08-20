import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Don't attach token on auth endpoints (login/register)
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const token = authService.token();
  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Never redirect auth endpoints — let the login/register component handle the error
      if (isAuthEndpoint) {
        return throwError(() => error);
      }

      switch (error.status) {
        case 401:
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { error: 'Session expirée. Veuillez vous reconnecter.' }
          });
          break;
        case 403:
          router.navigate(['/403']);
          break;
        case 404:
          break; // handled component-level
        case 500:
          console.error('Erreur serveur interne', error);
          break;
      }
      return throwError(() => error);
    })
  );
};
