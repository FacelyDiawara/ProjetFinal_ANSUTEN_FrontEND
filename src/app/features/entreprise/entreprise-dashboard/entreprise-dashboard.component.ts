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
        <h1>Espace Entreprise</h1>
        <p>Gérez vos offres de stage et sélectionnez vos futurs talents.</p>
      </div>
      <div class="welcome-actions">
        <a routerLink="/entreprise/offres/nouvelle" class="banner-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Publier une offre
        </a>
      </div>
    </div>

    <div class="kpi-grid">
      <a routerLink="/entreprise/offres" class="kpi-card bg-emerald">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-value">{{ offresCount() }}</div>
          <div class="kpi-label">Mes Offres Publiées</div>
        </div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/entreprise/offres" class="kpi-card bg-indigo">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-value">{{ offresOuvertes() }}</div>
          <div class="kpi-label">Offres Actives</div>
        </div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/entreprise/candidatures" class="kpi-card bg-amber">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-value">{{ candidaturesCount() }}</div>
          <div class="kpi-label">Candidatures Reçues</div>
        </div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/entreprise/candidatures" class="kpi-card bg-cyan">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        <div class="kpi-info">
          <div class="kpi-value">{{ candidaturesEnAttente() }}</div>
          <div class="kpi-label">En Attente de Traitement</div>
        </div>
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
    /* Banner */
    .welcome-banner {
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
      border-radius: 16px;
      padding: 1.25rem 2rem;
      color: white;
      position: relative;
      overflow: hidden;
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 20px -5px rgba(16, 185, 129, 0.35);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .welcome-banner::after {
      content: ''; position: absolute; right: -50px; bottom: -80px; width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%);
      border-radius: 50%; pointer-events: none;
    }
    .welcome-banner::before {
      content: ''; position: absolute; left: 10%; top: -80px; width: 180px; height: 180px;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
      border-radius: 50%; pointer-events: none;
    }
    .welcome-content { position: relative; z-index: 1; }
    .welcome-content h1 { font-size: 1.4rem; font-weight: 800; color: white; margin-bottom: 0.15rem; letter-spacing: -0.02em; }
    .welcome-content p { font-size: 0.85rem; color: rgba(255,255,255,0.85); max-width: 480px; font-weight: 400; line-height: 1.4; margin: 0; }
    .welcome-actions { position: relative; z-index: 1; }
    .banner-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1.25rem; border-radius: 8px;
      background: white; color: #059669; font-weight: 700; font-size: 0.85rem;
      text-decoration: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .banner-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }

    /* KPI Grid */
    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .kpi-card { 
      display:flex; flex-direction:row; align-items:center; gap:1rem;
      padding:1rem 1.25rem; border-radius:12px; color:white; position:relative; overflow:hidden; text-decoration:none; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition:transform 0.2s, box-shadow 0.2s; 
      &:hover{ transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.15); } 
    }

    .bg-indigo { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .bg-cyan   { background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); }
    .bg-emerald{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .bg-amber  { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

    .kpi-top { display:none; }
    .kpi-icon { width:42px; height:42px; border-radius:10px; background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .kpi-info { display:flex; flex-direction:column; justify-content:center; }
    .kpi-value { font-size:1.7rem; font-weight:800; line-height:1.1; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-0.03em; }
    .kpi-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; opacity:0.85; margin-top:0.15rem; }
    .kpi-badge { display:none; }
    .kpi-decor { position:absolute; width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,0.07); bottom:-20px; right:-20px; pointer-events:none; }

    /* Quick Actions */
    .quick-actions { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1.25rem; }
    .quick-action-btn { 
      display:flex; align-items:center; gap:1.25rem; padding:1.35rem 1.5rem; border-radius:16px; background:#f8fafc; border:1.5px solid #e2e8f0; text-decoration:none; color:#1e293b; transition:all 0.2s; 
      &:hover{ border-color:#6ee7b7; background:#ffffff; box-shadow:0 12px 25px -5px rgba(16, 185, 129, 0.12); transform:translateY(-2px); } 
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
