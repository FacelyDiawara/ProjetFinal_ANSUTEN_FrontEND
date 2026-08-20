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
      <a routerLink="/admin/etudiants" class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-title">Étudiants</div>
          <div class="kpi-icon-wrap" style="background:#eef2ff;color:#6366f1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
          </div>
        </div>
        <div class="kpi-num">{{ etudiantCount() }}</div>
        <div class="kpi-sub">Comptes actifs</div>
      </a>

      <a routerLink="/admin/entreprises" class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-title">Entreprises</div>
          <div class="kpi-icon-wrap" style="background:#f0f9ff;color:#0ea5e9">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2z"/></svg>
          </div>
        </div>
        <div class="kpi-num">{{ entrepriseCount() }}</div>
        <div class="kpi-sub">Partenaires validés</div>
      </a>

      <a routerLink="/admin/offres" class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-title">Offres de Stage</div>
          <div class="kpi-icon-wrap" style="background:#ecfdf5;color:#10b981">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>
          </div>
        </div>
        <div class="kpi-num">{{ offres().length }}</div>
        <div class="kpi-sub">Publiées sur UniStage</div>
      </a>

      <a routerLink="/admin/candidatures" class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-title">Candidatures</div>
          <div class="kpi-icon-wrap" style="background:#fffbeb;color:#f59e0b">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
          </div>
        </div>
        <div class="kpi-num">{{ candidatures().length }}</div>
        <div class="kpi-sub">Total soumises</div>
      </a>
    </div>

    <!-- Content Sections -->
    <div class="dash-row">
      <!-- Offres Analytics -->
      <div class="admin-panel flex-2">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Statut des Offres</h3>
            <p class="panel-sub">Volume et répartition actuelle</p>
          </div>
          <a routerLink="/admin/offres" class="btn btn-outline btn-sm">Gérer</a>
        </div>
        <div class="panel-body">
          <div class="admin-bars">
            <div class="a-bar-item">
              <div class="a-bar-info">
                <span class="a-bar-label"><span class="status-dot success"></span> Ouvertes</span>
                <span class="a-bar-val">{{ count(offres(),'OUVERTE') }} <span style="font-size:0.8rem; color:#94a3b8; font-weight:600">({{ pct(offres(),'OUVERTE') | number:'1.0-0' }}%)</span></span>
              </div>
              <div class="a-bar-track"><div class="a-bar-fill success-grad" [style.width.%]="pct(offres(),'OUVERTE')"></div></div>
            </div>
            
            <div class="a-bar-item">
              <div class="a-bar-info">
                <span class="a-bar-label"><span class="status-dot danger"></span> Fermées</span>
                <span class="a-bar-val">{{ count(offres(),'FERMEE') }} <span style="font-size:0.8rem; color:#94a3b8; font-weight:600">({{ pct(offres(),'FERMEE') | number:'1.0-0' }}%)</span></span>
              </div>
              <div class="a-bar-track"><div class="a-bar-fill danger-grad" [style.width.%]="pct(offres(),'FERMEE')"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Candidatures Analytics -->
      <div class="admin-panel flex-1">
        <div class="panel-header">
          <h3 class="panel-title">Entonnoir Candidatures</h3>
        </div>
        <div class="panel-body">
          <div class="funnel-list">
            <div class="funnel-item">
              <div class="f-icon warning"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>
              <div class="f-details">
                <span class="f-name">En attente</span>
                <strong class="f-count">{{ count(candidatures(),'EN_ATTENTE') }}</strong>
              </div>
            </div>
            <div class="funnel-item">
              <div class="f-icon success"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
              <div class="f-details">
                <span class="f-name">Acceptées</span>
                <strong class="f-count">{{ count(candidatures(),'ACCEPTEE') }}</strong>
              </div>
            </div>
            <div class="funnel-item">
              <div class="f-icon danger"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg></div>
              <div class="f-details">
                <span class="f-name">Rejetées</span>
                <strong class="f-count">{{ count(candidatures(),'REJETEE') }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; animation: pulse-dot 2s infinite; }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1.25rem; margin-bottom:1.5rem; }
    .kpi-card {
      background:#fff; border-radius:14px; border:1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      padding: 1.25rem;
      position:relative; overflow:hidden;
      transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      text-decoration:none;
      display:flex; flex-direction:column; gap:0.5rem;
      &:hover { transform:translateY(-3px); box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border-color:#cbd5e1; }
    }
    .kpi-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.25rem; }
    .kpi-icon-wrap {
      width:36px; height:36px; border-radius:10px;
      display:flex; align-items:center; justify-content:center;
    }
    .kpi-title { font-size:0.85rem; font-weight:600; color:#475569; }
    .kpi-num { font-size:2rem; font-weight:800; color:#0f172a; line-height:1; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-0.03em; }
    .kpi-sub { font-size:0.75rem; color:#94a3b8; }

    .dash-row { display:grid; grid-template-columns:2fr 1fr; gap:1.25rem; }
    @media (max-width:900px) { .dash-row { grid-template-columns:1fr; } }
    .flex-2 { flex:2; }
    .flex-1 { flex:1; }

    /* Admin Panels */
    .admin-panel {
      background:#fff; border-radius:16px;
      box-shadow: 0 4px 20px -4px rgba(0,0,0,0.03);
      border: 1px solid #e2e8f0;
      display:flex; flex-direction:column;
    }
    .panel-header {
      padding: 1.5rem 1.75rem; border-bottom: 1px solid #f1f5f9;
      display:flex; justify-content:space-between; align-items:center;
    }
    .panel-title { font-size:1.15rem; font-weight:800; color:#0f172a; margin-bottom:0.15rem; }
    .panel-sub { font-size:0.85rem; color:#64748b; }
    .panel-body { padding: 1.75rem; flex:1; }

    /* Progress Bars */
    .admin-bars { display:flex; flex-direction:column; gap:1.75rem; }
    .a-bar-info { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:0.6rem; }
    .a-bar-label { display:flex; align-items:center; gap:0.6rem; font-size:0.95rem; font-weight:600; color:#334155; }
    .a-bar-val { font-size:1.35rem; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; color:#0f172a; line-height:1; }
    .status-dot { width:12px; height:12px; border-radius:50%; }
    .status-dot.success { background:#10b981; box-shadow:0 0 0 4px rgba(16,185,129,0.15); }
    .status-dot.danger { background:#ef4444; box-shadow:0 0 0 4px rgba(239,68,68,0.15); }
    
    .a-bar-track { height:14px; background:#f1f5f9; border-radius:99px; overflow:hidden; }
    .a-bar-fill { height:100%; border-radius:99px; transition:width 1s cubic-bezier(0.4,0,0.2,1); }
    .success-grad { background:linear-gradient(90deg, #10b981, #34d399); }
    .danger-grad { background:linear-gradient(90deg, #ef4444, #f87171); }

    /* Funnel List */
    .funnel-list { display:flex; flex-direction:column; gap:1rem; }
    .funnel-item {
      display:flex; align-items:center; gap:1.25rem;
      padding:1.1rem 1.25rem; border-radius:12px; border:1px solid #f1f5f9;
      transition:all 0.2s;
      background:#fff;
    }
    .funnel-item:hover { border-color:#cbd5e1; background:#f8fafc; transform:translateX(4px); box-shadow:0 4px 12px rgba(0,0,0,0.03); }
    .f-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .f-icon.warning { background:#fffbeb; color:#d97706; }
    .f-icon.success { background:#ecfdf5; color:#059669; }
    .f-icon.danger { background:#fef2f2; color:#dc2626; }
    .f-details { display:flex; flex-direction:column; }
    .f-name { font-size:0.85rem; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
    .f-count { font-size:1.4rem; font-weight:800; color:#0f172a; font-family:'Plus Jakarta Sans',sans-serif; line-height:1.2; }
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
