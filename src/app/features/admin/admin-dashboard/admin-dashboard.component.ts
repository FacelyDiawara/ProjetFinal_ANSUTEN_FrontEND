import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OffreStageService } from '../../../services/offre-stage.service';
import { CandidatureService } from '../../../services/candidature.service';
import { EtudiantService } from '../../../services/etudiant.service';
import { EntrepriseService } from '../../../services/entreprise.service';

import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>Tableau de bord Général ⚡</h1>
        <p>Vue globale en temps réel des activités, entreprises partenaires, étudiants inscrits et candidatures sur UniStage.</p>
      </div>
      <div class="welcome-actions">
        <span class="badge badge-success" style="padding:0.5rem 1.1rem; font-size:0.825rem; background:rgba(16, 185, 129, 0.2); color:#34d399; backdrop-filter:blur(4px);">
          <span class="live-dot"></span>&nbsp; Plateforme opérationnelle
        </span>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <a routerLink="/admin/etudiants" class="kpi-card bg-indigo">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
          </div>
          <span class="kpi-badge">+12%</span>
        </div>
        <div class="kpi-value">{{ etudiantCount() }}</div>
        <div class="kpi-label">Étudiants Inscrits</div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/admin/entreprises" class="kpi-card bg-cyan">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2z"/></svg>
          </div>
          <span class="kpi-badge">Partenaires</span>
        </div>
        <div class="kpi-value">{{ entrepriseCount() }}</div>
        <div class="kpi-label">Entreprises Partenaires</div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/admin/offres" class="kpi-card bg-emerald">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>
          </div>
          <span class="kpi-badge">Publiées</span>
        </div>
        <div class="kpi-value">{{ offres().length }}</div>
        <div class="kpi-label">Offres de Stage</div>
        <div class="kpi-decor"></div>
      </a>

      <a routerLink="/admin/candidatures" class="kpi-card bg-amber">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
          </div>
          <span class="kpi-badge">Soumises</span>
        </div>
        <div class="kpi-value">{{ candidatures().length }}</div>
        <div class="kpi-label">Total Candidatures</div>
        <div class="kpi-decor"></div>
      </a>
    </div>

    <!-- Content Sections -->
    <div class="dash-row">
      <div class="card flex-2">
        <div class="card-header">
          <div>
            <h3>Statut des Offres de Stage</h3>
            <p class="text-muted" style="font-size:0.8rem">Répartition des offres ouvertes, fermées et archivées</p>
          </div>
          <a routerLink="/admin/offres" class="btn btn-ghost btn-sm">Gérer les offres →</a>
        </div>
        <div class="card-body">
          <div class="bar-list">
            <div class="bar-item">
              <span class="bar-lbl"><span class="dot" style="background:#10b981"></span>Offres Ouvertes</span>
              <div class="bar-track"><div class="bar-fill" style="background:#10b981" [style.width.%]="pct(offres(),'OUVERTE')"></div></div>
              <span class="bar-num">{{ count(offres(),'OUVERTE') }} ({{ pct(offres(),'OUVERTE') | number:'1.0-0' }}%)</span>
            </div>
            <div class="bar-item">
              <span class="bar-lbl"><span class="dot" style="background:#ef4444"></span>Offres Fermées</span>
              <div class="bar-track"><div class="bar-fill" style="background:#ef4444" [style.width.%]="pct(offres(),'FERMEE')"></div></div>
              <span class="bar-num">{{ count(offres(),'FERMEE') }} ({{ pct(offres(),'FERMEE') | number:'1.0-0' }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card flex-1">
        <div class="card-header">
          <h3>Traitement Candidatures</h3>
        </div>
        <div class="card-body">
          <div class="cand-grid">
            <div class="cand-box" style="background:#fffbeb; border:1px solid #fde68a">
              <strong style="color:#d97706">{{ count(candidatures(),'EN_ATTENTE') }}</strong>
              <span>En attente</span>
            </div>
            <div class="cand-box" style="background:#ecfdf5; border:1px solid #a7f3d0">
              <strong style="color:#059669">{{ count(candidatures(),'ACCEPTEE') }}</strong>
              <span>Acceptées</span>
            </div>
            <div class="cand-box" style="background:#fef2f2; border:1px solid #fecaca">
              <strong style="color:#dc2626">{{ count(candidatures(),'REJETEE') }}</strong>
              <span>Rejetées</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; animation: pulse-dot 2s infinite; }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .kpi-card { 
      display:flex; 
      flex-direction:column; 
      padding:1.5rem; 
      border-radius:20px; 
      text-decoration:none; 
      color:white; 
      position:relative; 
      overflow:hidden; 
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      transition:transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s; 
      &:hover { transform:translateY(-4px); box-shadow:0 15px 35px rgba(0,0,0,0.18); } 
    }
    
    .bg-indigo { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .bg-cyan   { background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); }
    .bg-emerald{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .bg-amber  { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

    .kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .kpi-icon { width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; }
    .kpi-badge { font-size:0.7rem; font-weight:700; background:rgba(255,255,255,0.22); padding:0.25rem 0.65rem; border-radius:9999px; letter-spacing:0.03em; }
    .kpi-value { font-size:2.25rem; font-weight:800; line-height:1; margin-bottom:0.35rem; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-0.03em; }
    .kpi-label { font-size:0.78rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; opacity:0.85; }
    .kpi-decor { position:absolute; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.07); bottom:-25px; right:-25px; pointer-events:none; }

    .dash-row { display:grid; grid-template-columns:2fr 1fr; gap:1.25rem; }
    @media (max-width:900px) { .dash-row { grid-template-columns:1fr; } }

    .flex-2 { flex:2; }
    .flex-1 { flex:1; }

    .bar-list { display:flex; flex-direction:column; gap:1.25rem; }
    .bar-item { display:flex; align-items:center; gap:1rem; }
    .bar-lbl { display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:#475569; font-weight:600; min-width:130px; }
    .dot { width:10px; height:10px; border-radius:50%; }
    .bar-track { flex:1; height:10px; background:#f1f5f9; border-radius:9999px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:9999px; transition:width 0.8s ease; }
    .bar-num { font-size:0.85rem; font-weight:700; color:#334155; min-width:85px; text-align:right; }

    .cand-grid { display:grid; grid-template-columns:1fr; gap:0.875rem; }
    .cand-box { padding:1.1rem 1rem; border-radius:14px; text-align:center; display:flex; align-items:center; justify-content:space-between; strong { font-size:1.65rem; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; } span { font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#475569; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private offreService       = inject(OffreStageService);
  private candidatureService = inject(CandidatureService);
  private etudiantService    = inject(EtudiantService);
  private entrepriseService  = inject(EntrepriseService);

  offres          = signal<any[]>([]);
  candidatures    = signal<any[]>([]);
  etudiantCount   = signal(0);
  entrepriseCount = signal(0);

  ngOnInit() {
    this.offreService.getAll().subscribe({ next: d => this.offres.set(d), error: () => {} });
    this.candidatureService.getAll().subscribe({ next: d => this.candidatures.set(d), error: () => {} });
    this.etudiantService.getAll().subscribe({ next: d => this.etudiantCount.set(d.length), error: () => {} });
    this.entrepriseService.getAll().subscribe({ next: d => this.entrepriseCount.set(d.length), error: () => {} });
  }

  count(list: any[], statut: string) { return list.filter(x => x.statut === statut).length; }
  pct(list: any[], statut: string) { return list.length ? (this.count(list, statut) / list.length) * 100 : 0; }
}
