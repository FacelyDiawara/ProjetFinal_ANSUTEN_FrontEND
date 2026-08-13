import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-code">404</div>
      <h1>Page introuvable</h1>
      <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
    </div>
  `,
  styles: [`
    :host { display:flex; height:100dvh; align-items:center; justify-content:center; background:#f9fafb; }
    .error-page { text-align:center; padding:2rem; }
    .error-code { font-size:6rem; font-weight:900; color:#e5e7eb; line-height:1; font-family:'Plus Jakarta Sans',sans-serif; }
    h1 { font-size:1.75rem; font-weight:800; color:#111827; margin:0.5rem 0; }
    p { color:#6b7280; margin-bottom:2rem; }
  `]
})
export class NotFoundComponent {}
