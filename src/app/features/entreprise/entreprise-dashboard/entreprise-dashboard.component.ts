import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CandidatureService } from '../../../services/candidature.service';
import { OffreStageService } from '../../../services/offre-stage.service';

@Component({
  selector: 'app-entreprise-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>Espace Entreprise 🏢</h1>
        <p>Gérez vos offres de stage, consultez les candidatures reçues et sélectionnez vos futurs talents.</p>
      </div>
      <div class="welcome-actions">
        <a routerLink="/entreprise/offres/nouvelle" class="btn btn-primary btn-lg" style="box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Publier une nouvelle offre
        </a>
      </div>
    </div>

    <div class="kpi-grid">
      <a routerLink="/entreprise/offres" class="kpi-card bg-emerald">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>
          </div>
          <span class="kpi-badge">Offres</span>
        </div>
        <div class="kpi-value">{{ offresCount() }}</div>
        <div class="kpi-label">Mes Offres Publiées</div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/entreprise/offres" class="kpi-card bg-indigo">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <span class="kpi-badge">Ouvertes</span>
        </div>
        <div class="kpi-value">{{ offresOuvertes() }}</div>
        <div class="kpi-label">Offres Actives</div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/entreprise/candidatures" class="kpi-card bg-amber">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
          </div>
          <span class="kpi-badge">Total</span>
        </div>
        <div class="kpi-value">{{ candidaturesCount() }}</div>
        <div class="kpi-label">Candidatures Reçues</div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/entreprise/candidatures" class="kpi-card bg-cyan">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <span class="kpi-badge">À traiter</span>
        </div>
        <div class="kpi-value">{{ candidaturesEnAttente() }}</div>
        <div class="kpi-label">En Attente de Traitement</div>
        <div class="kpi-decor"></div>
      </a>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <h3>Actions Rapides & Raccourcis</h3>
          <p class="text-muted" style="font-size:0.8rem">Accédez facilement aux fonctionnalités clé de votre espace entreprise</p>
        </div>
      </div>
      <div class="card-body">
        <div class="quick-actions">
          <a routerLink="/entreprise/offres/nouvelle" class="quick-action-btn">
            <div class="qa-icon" style="background:#eef2ff;color:#4f46e5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </div>
            <div class="qa-text">
              <strong>Créer une offre</strong>
              <span>Rédiger et publier un nouveau besoin en stage</span>
            </div>
          </a>

          <a routerLink="/entreprise/candidatures" class="quick-action-btn">
            <div class="qa-icon" style="background:#fffbeb;color:#d97706">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
            </div>
            <div class="qa-text">
              <strong>Évaluer candidatures</strong>
              <span>Examiner et répondre aux étudiants postulants</span>
            </div>
          </a>

          <a routerLink="/entreprise/profil" class="quick-action-btn">
            <div class="qa-icon" style="background:#ecfdf5;color:#059669">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div class="qa-text">
              <strong>Profil Entreprise</strong>
              <span>Mettre à jour les détails de votre profil</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .kpi-card { 
      display:flex; flex-direction:column; padding:1.5rem; border-radius:20px; color:white; position:relative; overflow:hidden; text-decoration:none; 
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      transition:transform 0.25s, box-shadow 0.25s; 
      &:hover{ transform:translateY(-4px); box-shadow:0 15px 35px rgba(0,0,0,0.18); } 
    }

    .bg-indigo { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .bg-cyan   { background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); }
    .bg-emerald{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .bg-amber  { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

    .kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .kpi-icon { width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; }
    .kpi-badge { font-size:0.75rem; font-weight:700; background:rgba(255,255,255,0.22); padding:0.25rem 0.65rem; border-radius:9999px; }
    .kpi-value { font-size:2.25rem; font-weight:800; line-height:1; margin-bottom:0.35rem; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-0.03em; }
    .kpi-label { font-size:0.78rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; opacity:0.85; }
    .kpi-decor { position:absolute; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.07); bottom:-25px; right:-25px; pointer-events:none; }

    .quick-actions { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1.25rem; }
    .quick-action-btn { 
      display:flex; align-items:center; gap:1.25rem; padding:1.35rem 1.5rem; border-radius:16px; background:#f8fafc; border:1.5px solid #e2e8f0; text-decoration:none; color:#1e293b; transition:all 0.2s; 
      &:hover{ border-color:#818cf8; background:#ffffff; box-shadow:0 12px 25px -5px rgba(79, 70, 229, 0.12); transform:translateY(-2px); } 
    }
    .qa-icon { width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .qa-text { display:flex; flex-direction:column; gap:0.2rem; strong { font-size:1rem; font-weight:700; color:#0f172a; } span { font-size:0.8rem; color:#64748b; } }
  `]
})
export class EntrepriseDashboardComponent implements OnInit {
  private svc     = inject(OffreStageService);
  private candSvc = inject(CandidatureService);

  offresCount           = signal(0);
  offresOuvertes        = signal(0);
  candidaturesCount     = signal(0);
  candidaturesEnAttente = signal(0);

  ngOnInit() {
    this.svc.getAll().subscribe({ next: d => { this.offresCount.set(d.length); this.offresOuvertes.set(d.filter(o => o.statut === 'OUVERTE').length); }, error: () => {} });
    this.candSvc.getAll().subscribe({ next: d => { this.candidaturesCount.set(d.length); this.candidaturesEnAttente.set(d.filter(c => c.statut === 'EN_ATTENTE').length); }, error: () => {} });
  }
}
