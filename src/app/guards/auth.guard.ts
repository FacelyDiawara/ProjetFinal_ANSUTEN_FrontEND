import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Guard: user must be authenticated */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/auth/login']);
};

/** Guard: user must be ADMIN */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/403']);
};

/** Guard: user must be ETUDIANT */
export const etudiantGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isEtudiant()) return true;
  return router.createUrlTree(['/403']);
};

/** Guard: user must be ENTREPRISE */
export const entrepriseGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isEntreprise()) return true;
  return router.createUrlTree(['/403']);
};

/** Guard: redirect authenticated users away from auth pages */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;

  const role = auth.role();
  if (role === 'ADMIN')      return router.createUrlTree(['/admin/dashboard']);
  if (role === 'ENTREPRISE') return router.createUrlTree(['/entreprise/dashboard']);
  return router.createUrlTree(['/etudiant/dashboard']);
};
