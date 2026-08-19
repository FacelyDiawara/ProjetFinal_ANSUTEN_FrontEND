import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, throwError } from 'rxjs';
import { AuthRequest, AuthResponse, Utilisateur, Role } from '../models/utilisateur';
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
  readonly role         = computed(() => this._user()?.role?.toUpperCase() ?? null);
  readonly isAdmin      = computed(() => this.role() === 'ADMIN');
  readonly isEntreprise = computed(() => this.role() === 'ENTREPRISE');
  readonly isEtudiant   = computed(() => this.role() === 'ETUDIANT' || this.role() === 'USER');

  login(creds: AuthRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, creds).pipe(
      tap(res => this.saveSession(res, creds.email)),
      catchError(err => {
        // Fallback local : fonctionne même si le backend est indisponible ou renvoie une erreur
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

        // Comptes de démonstration pré-configurés
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

        return throwError(() => ({ error: { message: 'E-mail ou mot de passe incorrect.' } }));
      })
    );
  }

  register(data: Utilisateur & { motDePasse: string }) {
    const requestedRole = data.role;

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.saveSession(res, data.email, requestedRole)),
      catchError(() => {
        // Fallback local : inscription en mode hors-ligne / backend indisponible
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
          role: requestedRole,
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

  /**
   * Extracts the role string from various possible JWT payload formats.
   * Handles: simple string, ROLE_ prefix, authorities array (strings or objects).
   */
  private extractRoleFromPayload(payload: Record<string, unknown>): string | null {
    // Direct role field
    if (typeof payload['role'] === 'string' && payload['role']) {
      return payload['role'];
    }

    // roles array (e.g. ["ENTREPRISE"])
    const roles = payload['roles'];
    if (Array.isArray(roles) && roles.length > 0) {
      const first = roles[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first !== null && 'authority' in first) {
        return (first as { authority: string }).authority;
      }
    }

    // Spring Security authorities (e.g. [{authority: "ROLE_ENTREPRISE"}])
    const authorities = payload['authorities'];
    if (Array.isArray(authorities) && authorities.length > 0) {
      const first = authorities[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first !== null && 'authority' in first) {
        return (first as { authority: string }).authority;
      }
    }

    // scope / scp (some OAuth2 implementations)
    if (typeof payload['scope'] === 'string' && payload['scope']) {
      return payload['scope'];
    }

    return null;
  }

  /**
   * Normalizes a raw role string to one of the application Role values.
   * Strips ROLE_ prefix, uppercases, and maps USER → ETUDIANT.
   */
  private normalizeRole(raw: string): Role {
    const normalized = raw.replace(/^ROLE_/i, '').toUpperCase();
    if (normalized === 'ADMIN') return 'ADMIN';
    if (normalized === 'ENTREPRISE') return 'ENTREPRISE';
    return 'ETUDIANT'; // fallback for USER, ETUDIANT, or unknown
  }

  private saveSession(res: AuthResponse | Record<string, unknown>, fallbackEmail?: string, fallbackRole?: Role | string): void {
    const token = (res as any).token || (res as any).jwt || (res as any).accessToken || 'mock-token';
    let user: Utilisateur | null = (res as any).utilisateur || (res as any).user || null;

    // Handle flat backend response format: { token, utilisateurId, nom, prenom, email, role }
    // The backend doesn't nest user data inside a "utilisateur" object
    if (!user && (res as any).email) {
      user = {
        id: (res as any).utilisateurId || (res as any).id,
        nom: (res as any).nom || 'Utilisateur',
        prenom: (res as any).prenom || '',
        email: (res as any).email,
        role: (res as any).role || 'ETUDIANT'
      };
    }

    // If backend returned a user object, ensure the role is properly normalized
    if (user) {
      if (fallbackRole) {
        // During registration: the role selected by the user in the form ALWAYS takes priority.
        // The backend may ignore the requested role and return a default (e.g. ETUDIANT).
        user.role = this.normalizeRole(fallbackRole);
      } else if (user.role) {
        user.role = this.normalizeRole(user.role);
      } else {
        user.role = 'ETUDIANT';
      }
    }

    // If no user object, try to decode the JWT payload
    if (!user && token && typeof token === 'string' && token.includes('.')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const extractedRole = fallbackRole
          ? null // Skip JWT role extraction when form role is available
          : this.extractRoleFromPayload(payload);
        user = {
          email: payload.sub || payload.email || fallbackEmail || '',
          role: fallbackRole
            ? this.normalizeRole(fallbackRole)
            : (extractedRole ? this.normalizeRole(extractedRole) : 'ETUDIANT'),
          id: payload.id || payload.userId,
          nom: payload.nom || payload.name || 'Utilisateur',
          prenom: payload.prenom || ''
        };
      } catch {
        user = null;
      }
    }

    // Last resort fallback
    if (!user) {
      user = {
        email: fallbackEmail || 'user@example.com',
        role: fallbackRole ? this.normalizeRole(fallbackRole) : 'ETUDIANT',
        nom: 'Utilisateur',
        prenom: ''
      };
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }
}
