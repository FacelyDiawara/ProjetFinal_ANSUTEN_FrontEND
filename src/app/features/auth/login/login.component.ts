import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white"/>
              <path d="M8 26L18 10L28 26H8Z" fill="url(#g1)" opacity="0.9"/>
              <circle cx="18" cy="18" r="4" fill="white"/>
              <defs>
                <linearGradient id="g1" x1="8" y1="26" x2="28" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#4f46e5"/>
                  <stop offset="1" stop-color="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="brand-name">UniStage</span>
        </div>
        <div class="auth-hero">
          <h1>La plateforme de stages de l'Université de Labé</h1>
          <p>Connectez étudiants et entreprises pour des opportunités de stage enrichissantes.</p>
          <div class="auth-features">
            @for (f of features; track f.title) {
              <div class="feature-item">
                <div class="feature-icon" [innerHTML]="f.icon"></div>
                <div>
                  <strong>{{ f.title }}</strong>
                  <span>{{ f.desc }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-card-header">
            <h2>Bon retour 👋</h2>
            <p>Connectez-vous à votre espace</p>
          </div>

          @if (errorMsg()) {
            <div class="alert alert-danger mb-4" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group mb-4">
              <label class="form-label" for="email">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                class="form-control"
                formControlName="email"
                placeholder="vous@exemple.com"
                autocomplete="email"
              />
              @if (f['email'].invalid && f['email'].touched) {
                <span class="form-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  E-mail invalide
                </span>
              }
            </div>

            <div class="form-group mb-5">
              <label class="form-label" for="password">Mot de passe</label>
              <div class="password-field">
                <input
                  id="password"
                  [type]="showPwd() ? 'text' : 'password'"
                  class="form-control"
                  formControlName="motDePasse"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button type="button" class="pwd-toggle" (click)="showPwd.set(!showPwd())" [attr.aria-label]="showPwd() ? 'Masquer' : 'Afficher'">
                  @if (showPwd()) {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (f['motDePasse'].invalid && f['motDePasse'].touched) {
                <span class="form-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  Mot de passe requis
                </span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span>
                Connexion...
              } @else {
                Se connecter
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Pas encore de compte ? <a routerLink="/auth/register" class="link">S'inscrire</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100dvh; }
    .w-full { width: 100%; justify-content: center; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-5 { margin-bottom: 1.5rem; }

    .auth-page {
      display: flex;
      height: 100%;
    }

    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      color: white;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: rgba(255,255,255,0.04);
        bottom: -100px;
        right: -100px;
      }
      &::after {
        content: '';
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: rgba(255,255,255,0.04);
        top: 100px;
        right: 50px;
      }
    }

    .auth-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: auto;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .brand-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .auth-hero {
      position: relative;
      z-index: 1;

      h1 {
        font-size: 2.25rem;
        font-weight: 800;
        color: white;
        line-height: 1.2;
        margin-bottom: 1rem;
        letter-spacing: -0.03em;
      }

      p {
        font-size: 1rem;
        color: rgba(255,255,255,0.7);
        margin-bottom: 2.5rem;
        line-height: 1.6;
      }
    }

    .auth-features {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;

      .feature-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255,255,255,0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: white;
      }

      div {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      strong {
        font-size: 0.9rem;
        color: white;
        font-weight: 600;
      }

      span {
        font-size: 0.8rem;
        color: rgba(255,255,255,0.6);
      }
    }

    .auth-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f9fafb;
      overflow-y: auto;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    .auth-card-header {
      margin-bottom: 2rem;

      h2 {
        font-size: 1.75rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 0.375rem;
      }

      p {
        color: #6b7280;
        font-size: 0.9rem;
      }
    }

    .password-field {
      position: relative;

      .form-control { padding-right: 3rem; }
    }

    .pwd-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      display: flex;
      align-items: center;
      transition: color 0.2s;
      &:hover { color: #374151; }
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #6b7280;
      font-size: 0.875rem;

      .link {
        color: #4f46e5;
        font-weight: 600;
        &:hover { text-decoration: underline; }
      }
    }

    @media (max-width: 768px) {
      .auth-page { flex-direction: column; }
      .auth-left { display: none; }
      .auth-right { width: 100%; flex: 1; }
    }
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required]
  });

  loading  = signal(false);
  showPwd  = signal(false);
  errorMsg = signal<string | null>(null);

  get f() { return this.form.controls; }

  features = [
    {
      title: "Offres de stage",
      desc: "Accédez à des centaines d'offres de stage",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 0h-4V4h4v2z"/></svg>`
    },
    {
      title: "Candidature simple",
      desc: "Postulez en quelques clics depuis votre espace",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>`
    },
    {
      title: "Suivi en temps réel",
      desc: "Suivez l'état de vos candidatures en direct",
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    }
  ];

  ngOnInit() {
    const err = this.route.snapshot.queryParamMap.get('error');
    if (err) this.errorMsg.set(err);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMsg.set(null);

    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        // Role is already parsed and stored by saveSession — use the service's computed signal
        const role = this.auth.role();
        if (role === 'ADMIN')           this.router.navigate(['/admin/dashboard']);
        else if (role === 'ENTREPRISE') this.router.navigate(['/entreprise/dashboard']);
        else                            this.router.navigate(['/etudiant/dashboard']);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(
          err.status === 401
            ? 'E-mail ou mot de passe incorrect.'
            : 'Erreur de connexion. Veuillez réessayer.'
        );
      }
    });
  }
}
