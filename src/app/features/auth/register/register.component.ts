import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page register-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white"/>
              <path d="M8 26L18 10L28 26H8Z" fill="url(#g2)" opacity="0.9"/>
              <circle cx="18" cy="18" r="4" fill="white"/>
              <defs>
                <linearGradient id="g2" x1="8" y1="26" x2="28" y2="10" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#4f46e5"/><stop offset="1" stop-color="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="brand-name">UniStage</span>
        </div>
        <div class="auth-hero">
          <h1>Rejoignez la plateforme</h1>
          <p>Créez votre compte en quelques minutes et accédez à toutes les opportunités de stage.</p>
          <div class="role-cards">
            <div class="role-card" [class.active]="form.get('role')?.value === 'ETUDIANT'" (click)="setRole('ETUDIANT')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
              <div>
                <strong>Étudiant</strong>
                <span>Postulez aux offres de stage</span>
              </div>
            </div>
            <div class="role-card" [class.active]="form.get('role')?.value === 'ENTREPRISE'" (click)="setRole('ENTREPRISE')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm0-4H4V5h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z"/></svg>
              <div>
                <strong>Entreprise</strong>
                <span>Publiez vos offres de stage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-card-header">
            <h2>Créer un compte</h2>
            <p>Remplissez le formulaire ci-dessous</p>
          </div>

          @if (errorMsg()) {
            <div class="alert alert-danger" style="margin-bottom:1rem" role="alert">{{ errorMsg() }}</div>
          }
          @if (successMsg()) {
            <div class="alert alert-success" style="margin-bottom:1rem" role="status">{{ successMsg() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row" style="margin-bottom:1rem">
              <div class="form-group">
                <label class="form-label" for="nom">Nom</label>
                <input id="nom" type="text" class="form-control" formControlName="nom" placeholder="Diallo" autocomplete="family-name"/>
                @if (f['nom'].invalid && f['nom'].touched) {
                  <span class="form-error">Nom requis</span>
                }
              </div>
              <div class="form-group">
                <label class="form-label" for="prenom">Prénom</label>
                <input id="prenom" type="text" class="form-control" formControlName="prenom" placeholder="Mamadou" autocomplete="given-name"/>
                @if (f['prenom'].invalid && f['prenom'].touched) {
                  <span class="form-error">Prénom requis</span>
                }
              </div>
            </div>

            <div class="form-group" style="margin-bottom:1rem">
              <label class="form-label" for="reg-email">E-mail</label>
              <input id="reg-email" type="email" class="form-control" formControlName="email" placeholder="vous@exemple.com" autocomplete="email"/>
              @if (f['email'].invalid && f['email'].touched) {
                <span class="form-error">E-mail valide requis</span>
              }
            </div>

            <div class="form-group" style="margin-bottom:1rem">
              <label class="form-label" for="reg-pwd">Mot de passe</label>
              <input id="reg-pwd" type="password" class="form-control" formControlName="motDePasse" placeholder="••••••••" autocomplete="new-password"/>
              @if (f['motDePasse'].invalid && f['motDePasse'].touched) {
                <span class="form-error">Minimum 6 caractères</span>
              }
            </div>

            <div class="form-group" style="margin-bottom:1.5rem">
              <label class="form-label" for="role">Rôle</label>
              <select id="role" class="form-control form-select" formControlName="role">
                <option value="ETUDIANT">Étudiant</option>
                <option value="ENTREPRISE">Entreprise</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span> Inscription...
              } @else {
                Créer mon compte
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Déjà inscrit ? <a routerLink="/auth/login" class="link">Se connecter</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100dvh; }
    .w-full { width: 100%; justify-content: center; }

    .auth-page {
      display: flex;
      height: 100%;
    }

    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%);
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      color: white;
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        width: 400px; height: 400px;
        border-radius: 50%;
        background: rgba(255,255,255,0.04);
        bottom: -100px; right: -100px;
      }
    }

    .auth-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: auto;
    }

    .brand-logo {
      width: 44px; height: 44px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .brand-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
    }

    .auth-hero {
      position: relative;
      z-index: 1;
      h1 { font-size: 2rem; font-weight: 800; color: white; margin-bottom: 1rem; letter-spacing: -0.03em; }
      p  { color: rgba(255,255,255,0.7); margin-bottom: 2rem; line-height: 1.6; }
    }

    .role-cards {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .role-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(255,255,255,0.1);
      cursor: pointer;
      transition: all 0.2s;
      border: 1.5px solid transparent;

      &:hover { background: rgba(255,255,255,0.15); }
      &.active { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.4); }

      div { display: flex; flex-direction: column; gap: 0.125rem; }
      strong { font-size: 0.9rem; color: white; font-weight: 600; }
      span { font-size: 0.78rem; color: rgba(255,255,255,0.6); }
    }

    .auth-right {
      width: 520px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #f9fafb;
      overflow-y: auto;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
    }

    .auth-card-header {
      margin-bottom: 1.75rem;
      h2 { font-size: 1.75rem; font-weight: 800; color: #111827; margin-bottom: 0.375rem; }
      p  { color: #6b7280; font-size: 0.9rem; }
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #6b7280;
      font-size: 0.875rem;
      .link { color: #4f46e5; font-weight: 600; &:hover { text-decoration: underline; } }
    }

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.875rem center;
      background-size: 1rem;
      padding-right: 2.5rem;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .auth-page { flex-direction: column; }
      .auth-left { display: none; }
      .auth-right { width: 100%; flex: 1; }
    }
  `]
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    nom:        ['', Validators.required],
    prenom:     ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    role:       ['ETUDIANT', Validators.required]
  });

  loading    = signal(false);
  errorMsg   = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  get f() { return this.form.controls; }

  setRole(role: string) {
    this.form.get('role')?.setValue(role);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMsg.set(null);

    const formData = this.form.getRawValue();

    this.auth.register(formData as any).subscribe({
      next: res => {
        this.loading.set(false);
        const role = res.utilisateur?.role || (res as any)?.user?.role || formData.role || 'ETUDIANT';
        if (role === 'ENTREPRISE') {
          this.router.navigate(['/entreprise/dashboard']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/etudiant/dashboard']);
        }
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(
          err?.error?.message || err?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.'
        );
      }
    });
  }
}
