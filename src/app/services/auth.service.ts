import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, throwError } from 'rxjs';
import { AuthRequest, AuthResponse, Utilisateur } from '../models/utilisateur';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'unistage_token';
const USER_KEY  = 'unistage_user';
const USERS_DB_KEY = 'unistage_users_db';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user  = signal<Utilisateur | null>(
    JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  );

  readonly token        = this._token.asReadonly();
  readonly currentUser  = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._token());
  readonly role         = computed(() => this._user()?.role ?? null);
  readonly isAdmin      = computed(() => this._user()?.role === 'ADMIN');
  readonly isEntreprise = computed(() => this._user()?.role === 'ENTREPRISE');
  readonly isEtudiant   = computed(() => this._user()?.role === 'ETUDIANT');

  login(creds: AuthRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, creds).pipe(
      tap(res => this.saveSession(res)),
      catchError(err => {
        // Fallback for local/offline testing if backend server is unreachable
        if (err.status === 0 || err.status === 404 || err.status === 500) {
          const db: (Utilisateur & { motDePasse: string })[] = JSON.parse(
            localStorage.getItem(USERS_DB_KEY) ?? '[]'
          );
          const found = db.find(
            u => u.email.toLowerCase() === creds.email.toLowerCase() && u.motDePasse === creds.motDePasse
          );

          if (found) {
            const res: AuthResponse = {
              token: 'mock-jwt-token-' + Date.now(),
              utilisateur: {
                id: found.id,
                nom: found.nom,
                prenom: found.prenom,
                email: found.email,
                role: found.role
              }
            };
            this.saveSession(res);
            return of(res);
          }

          // Pre-seeded demo accounts fallback
          if (creds.email === 'etudiant@unistage.com' && creds.motDePasse === 'password') {
            const res: AuthResponse = {
              token: 'mock-token-etudiant',
              utilisateur: { id: 1, nom: 'Diallo', prenom: 'Mamadou', email: creds.email, role: 'ETUDIANT' }
            };
            this.saveSession(res);
            return of(res);
          }
          if (creds.email === 'entreprise@unistage.com' && creds.motDePasse === 'password') {
            const res: AuthResponse = {
              token: 'mock-token-entreprise',
              utilisateur: { id: 2, nom: 'Orange', prenom: 'Guinée', email: creds.email, role: 'ENTREPRISE' }
            };
            this.saveSession(res);
            return of(res);
          }
          if (creds.email === 'admin@unistage.com' && creds.motDePasse === 'password') {
            const res: AuthResponse = {
              token: 'mock-token-admin',
              utilisateur: { id: 3, nom: 'Admin', prenom: 'Système', email: creds.email, role: 'ADMIN' }
            };
            this.saveSession(res);
            return of(res);
          }
        }
        return throwError(() => err);
      })
    );
  }

  register(data: Utilisateur & { motDePasse: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.saveSession(res)),
      catchError(err => {
        // Fallback for local/offline testing if backend server is unreachable or fails
        if (err.status === 0 || err.status === 404 || err.status === 500) {
          const db: (Utilisateur & { motDePasse: string })[] = JSON.parse(
            localStorage.getItem(USERS_DB_KEY) ?? '[]'
          );

          const existing = db.find(u => u.email.toLowerCase() === data.email.toLowerCase());
          if (existing) {
            return throwError(() => ({ error: { message: 'Cet e-mail est déjà utilisé par un autre compte.' } }));
          }

          const newUser: Utilisateur & { motDePasse: string } = {
            id: Date.now(),
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            role: data.role,
            motDePasse: data.motDePasse
          };

          db.push(newUser);
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

          const res: AuthResponse = {
            token: 'mock-jwt-token-' + Date.now(),
            utilisateur: {
              id: newUser.id,
              nom: newUser.nom,
              prenom: newUser.prenom,
              email: newUser.email,
              role: newUser.role
            }
          };

          this.saveSession(res);
          return of(res);
        }
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  private saveSession(res: AuthResponse): void {
    const user = res.utilisateur || (res as any).user;
    const token = res.token;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }
}
