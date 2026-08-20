import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthRequest, AuthResponse, Utilisateur, Role } from '../models/utilisateur';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'unistage_token';
const USER_KEY = 'unistage_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  // ==============================
  // RÉCUPÉRATION SÉCURISÉE SESSION
  // ==============================

  private getStoredUser(): Utilisateur | null {
    const storedUser = localStorage.getItem(USER_KEY);

    // Aucun utilisateur enregistré
    if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
      return null;
    }

    try {
      return JSON.parse(storedUser) as Utilisateur;
    } catch (error) {
      console.warn('Utilisateur enregistré invalide. Nettoyage du localStorage.');
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  private _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  private _user = signal<Utilisateur | null>(
    this.getStoredUser()
  );

  readonly token = this._token.asReadonly();
  readonly currentUser = this._user.asReadonly();

  readonly isLoggedIn = computed(() => !!this._token());

  readonly role = computed(
    () => this._user()?.role?.toUpperCase() ?? null
  );

  readonly isAdmin = computed(
    () => this.role() === 'ADMIN'
  );

  readonly isEntreprise = computed(
    () => this.role() === 'ENTREPRISE'
  );

  readonly isEtudiant = computed(
    () => this.role() === 'ETUDIANT' || this.role() === 'USER'
  );


  // ==============================
  // CONNEXION
  // ==============================

  login(creds: AuthRequest) {

    console.log('Connexion vers le backend :', {
      email: creds.email
    });

    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/login`,
        {
          email: creds.email,
          motDePasse: creds.motDePasse
        }
      )
      .pipe(

        tap(res => {

          console.log('Réponse du backend :', res);

          this.saveSession(res, creds.email);

        })

      );
  }


  // ==============================
  // INSCRIPTION
  // ==============================

  register(data: Utilisateur & { motDePasse: string }) {

    return this.http
      .post<AuthResponse>(
        `${environment.apiUrl}/auth/register`,
        {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          motDePasse: data.motDePasse
        }
      )
      .pipe(

        tap(res => {

          console.log('Inscription réussie :', res);

          this.saveSession(
            res,
            data.email,
            data.role
          );

        })

      );
  }


  // ==============================
  // DÉCONNEXION
  // ==============================

  logout(): void {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    this._token.set(null);
    this._user.set(null);

    this.router.navigate(['/auth/login']);
  }


  // ==============================
  // NORMALISATION DU ROLE
  // ==============================

  private normalizeRole(raw: string): Role {

    const normalized =
      raw
        .replace(/^ROLE_/i, '')
        .toUpperCase();

    if (normalized === 'ADMIN') {
      return 'ADMIN';
    }

    if (normalized === 'ENTREPRISE') {
      return 'ENTREPRISE';
    }

    return 'ETUDIANT';
  }


  // ==============================
  // SAUVEGARDE SESSION
  // ==============================

  private saveSession(
    res: AuthResponse | Record<string, unknown>,
    fallbackEmail?: string,
    fallbackRole?: Role | string
  ): void {

    // ------------------------------
    // Récupération du token
    // ------------------------------

    const token =
      (res as any).token ||
      (res as any).jwt ||
      (res as any).accessToken;

    if (!token) {

      console.error(
        'Le backend n\'a pas retourné de token JWT.',
        res
      );

      throw new Error(
        'Token JWT absent dans la réponse du serveur.'
      );
    }


    // ------------------------------
    // Récupération utilisateur
    // ------------------------------

    let user: Utilisateur | null =
      (res as any).utilisateur ||
      (res as any).user ||
      null;


    // ------------------------------
    // Ton backend renvoie actuellement
    // une réponse plate :
    //
    // token
    // utilisateurId
    // nom
    // prenom
    // email
    // role
    // ------------------------------

    if (!user && (res as any).email) {

      user = {

        id:
          (res as any).utilisateurId ||
          (res as any).id,

        nom:
          (res as any).nom ||
          'Utilisateur',

        prenom:
          (res as any).prenom ||
          '',

        email:
          (res as any).email,

        role:
          (res as any).role ||
          'ETUDIANT'
      };
    }


    // ------------------------------
    // Si l'utilisateur existe
    // normalisation du rôle
    // ------------------------------

    if (user) {

      if (fallbackRole) {

        user.role =
          this.normalizeRole(
            fallbackRole
          );

      } else if (user.role) {

        user.role =
          this.normalizeRole(
            user.role
          );

      } else {

        user.role = 'ETUDIANT';
      }
    }


    // ------------------------------
    // Dernier fallback
    // ------------------------------

    if (!user) {

      user = {

        id: 0,

        email:
          fallbackEmail ||
          '',

        role:
          fallbackRole
            ? this.normalizeRole(fallbackRole)
            : 'ETUDIANT',

        nom: 'Utilisateur',

        prenom: ''
      };
    }


    // ------------------------------
    // Sauvegarde
    // ------------------------------

    localStorage.setItem(
      TOKEN_KEY,
      token
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );


    // ------------------------------
    // Mise à jour des signals
    // ------------------------------

    this._token.set(token);
    this._user.set(user);


    console.log(
      'Session enregistrée :',
      user
    );
  }
}