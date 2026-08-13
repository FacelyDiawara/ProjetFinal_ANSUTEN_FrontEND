import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  const token = authService.token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
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
