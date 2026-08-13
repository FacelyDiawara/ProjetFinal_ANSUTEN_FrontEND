import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forbidden',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#ef4444">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14H9v-2h2v2zm0-4H9V7h2v4z"/>
        </svg>
      </div>
      <div class="error-code">403</div>
      <h1>Accès interdit</h1>
      <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
      <div class="error-btns">
        <button class="btn btn-outline" (click)="goBack()">← Retour</button>
        <a [routerLink]="homeRoute()" class="btn btn-primary">Mon tableau de bord</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display:flex; height:100dvh; align-items:center; justify-content:center; background:#f9fafb; }
    .error-page { text-align:center; padding:2rem; }
    .error-icon { width:80px;height:80px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem; }
    .error-code { font-size:5rem; font-weight:900; color:#fca5a5; line-height:1; font-family:'Plus Jakarta Sans',sans-serif; }
    h1 { font-size:1.75rem; font-weight:800; color:#111827; margin:0.5rem 0; }
    p { color:#6b7280; margin-bottom:2rem; }
    .error-btns { display:flex; gap:0.75rem; justify-content:center; }
  `]
})
export class ForbiddenComponent {
  private auth = inject(AuthService);

  homeRoute() {
    const role = this.auth.role();
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'ENTREPRISE') return '/entreprise/dashboard';
    if (role === 'ETUDIANT') return '/etudiant/dashboard';
    return '/auth/login';
  }

  goBack() { history.back(); }
}
