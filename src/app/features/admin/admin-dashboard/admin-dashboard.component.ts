import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OffreStageService } from '../../../services/offre-stage.service';
import { CandidatureService } from '../../../services/candidature.service';
import { EtudiantService } from '../../../services/etudiant.service';
import { EntrepriseService } from '../../../services/entreprise.service';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dash-header">
        <div class="header-titles">
          <h1>Bonjour, Admin 👋</h1>
          <p>Voici un aperçu général de la plateforme UniStage.</p>
        </div>
        <div class="header-actions">
          <div class="date-picker">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>{{ today | date:'dd MMM yyyy' }}</span>
          </div>
        </div>
      </div>

      <!-- KPI Row -->
      <div class="kpi-row">
        <!-- Étudiants -->
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon-wrap bg-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Étudiants</span>
              <div class="kpi-val-row">
                <span class="kpi-val">{{ etudiants().length }}</span>
              </div>
              <span class="kpi-sub">Total inscrits</span>
            </div>
          </div>
          <div class="kpi-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,20 Q10,10 20,25 T40,15 T60,25 T80,10 T100,5" fill="none" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/></svg></div>
        </div>

        <!-- Entreprises -->
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon-wrap bg-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2z"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Entreprises</span>
              <div class="kpi-val-row">
                <span class="kpi-val">{{ entreprises().length }}</span>
              </div>
              <span class="kpi-sub">Partenaires validés</span>
            </div>
          </div>
          <div class="kpi-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,25 Q10,15 20,20 T40,10 T60,25 T80,15 T100,5" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/></svg></div>
        </div>

        <!-- Offres -->
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon-wrap bg-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Offres de Stage</span>
              <div class="kpi-val-row">
                <span class="kpi-val">{{ offres().length }}</span>
              </div>
              <span class="kpi-sub">Publiées sur la plateforme</span>
            </div>
          </div>
          <div class="kpi-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,25 Q10,15 20,25 T40,15 T60,20 T80,10 T100,2" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/></svg></div>
        </div>

        <!-- Candidatures -->
        <div class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon-wrap bg-orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Candidatures</span>
              <div class="kpi-val-row">
                <span class="kpi-val">{{ candidatures().length }}</span>
              </div>
              <span class="kpi-sub">Total soumises</span>
            </div>
          </div>
          <div class="kpi-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,20 Q10,25 20,15 T40,25 T60,10 T80,15 T100,0" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/></svg></div>
        </div>
      </div>

      <!-- Middle Row -->
      <div class="middle-row">
        <!-- Line Chart Panel -->
        <div class="panel flex-2">
          <div class="panel-header">
            <h3>Évolution des Offres de Stage</h3>
          </div>
          <div class="panel-body chart-body">
            <!-- Mock SVG Line Chart -->
            <svg viewBox="0 0 600 250" class="line-chart">
              <defs>
                <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="rgba(168, 85, 247, 0.2)"/>
                  <stop offset="100%" stop-color="rgba(168, 85, 247, 0)"/>
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <g class="grid">
                <line x1="40" y1="20" x2="600" y2="20" />
                <line x1="40" y1="60" x2="600" y2="60" />
                <line x1="40" y1="100" x2="600" y2="100" />
                <line x1="40" y1="140" x2="600" y2="140" />
                <line x1="40" y1="180" x2="600" y2="180" />
                <line x1="40" y1="220" x2="600" y2="220" />
              </g>
              <!-- Line and Area -->
              <path d="M 40 180 Q 80 170 120 140 T 220 110 T 320 80 T 420 50 T 520 70 T 580 20 L 580 220 L 40 220 Z" fill="url(#chartGrad)"/>
              <path d="M 40 180 Q 80 170 120 140 T 220 110 T 320 80 T 420 50 T 520 70 T 580 20" fill="none" stroke="#a855f7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Data Point -->
              <circle cx="580" cy="20" r="6" fill="#fff" stroke="#a855f7" stroke-width="3"/>
              
              <!-- Tooltip Mock -->
              <g transform="translate(540, 25)">
                <rect x="0" y="0" width="60" height="40" rx="8" fill="#fff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
                <text x="30" y="18" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f172a">{{ offres().length }}</text>
                <text x="30" y="32" text-anchor="middle" font-size="10" fill="#64748b">Offres</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Donut Panel -->
        <div class="panel flex-1">
          <div class="panel-header"><h3>Statut des Offres</h3></div>
          <div class="panel-body center-flex">
            <div class="donut-container">
              <div class="donut-chart" [style.background]="getDonutGradient()">
                <div class="donut-hole">
                  <div class="donut-val">{{ offres().length }}</div>
                  <div class="donut-lbl">Total</div>
                </div>
              </div>
              <div class="donut-legend">
                <div class="legend-item"><span class="dot" style="background:#10b981"></span> Ouvertes<br><small>{{ count(offres(),'OUVERTE') }} ({{ pct(offres(),'OUVERTE') | number:'1.0-1' }}%)</small></div>
                <div class="legend-item"><span class="dot" style="background:#f59e0b"></span> Fermées<br><small>{{ count(offres(),'FERMEE') }} ({{ pct(offres(),'FERMEE') | number:'1.0-1' }}%)</small></div>
              </div>
            </div>
            <div class="panel-footer-link"><a routerLink="/admin/offres">Gérer les offres</a></div>
          </div>
        </div>

        <!-- Funnel Panel -->
        <div class="panel flex-1">
          <div class="panel-header"><h3>Entonnoir des Candidatures</h3></div>
          <div class="panel-body center-flex">
            <div class="funnel-container">
              
              <div class="funnel-tier bg-blue" style="width: 100%;">
                <span class="f-val">{{ candidatures().length }}</span>
                <div class="f-label-side">Total</div>
              </div>
              
              <div class="funnel-tier bg-green" [style.width]="(pct(candidatures(),'EN_ATTENTE') || 80) + '%'">
                <span class="f-val">{{ count(candidatures(),'EN_ATTENTE') }}</span>
                <div class="f-label-side">En attente<br><small>{{ pct(candidatures(),'EN_ATTENTE') | number:'1.0-1' }}%</small></div>
              </div>
              
              <div class="funnel-tier bg-orange" [style.width]="(pct(candidatures(),'ACCEPTEE') || 60) + '%'">
                <span class="f-val">{{ count(candidatures(),'ACCEPTEE') }}</span>
                <div class="f-label-side">Acceptées<br><small>{{ pct(candidatures(),'ACCEPTEE') | number:'1.0-1' }}%</small></div>
              </div>
              
              <div class="funnel-tier bg-red" [style.width]="(pct(candidatures(),'REJETEE') || 40) + '%'">
                <span class="f-val">{{ count(candidatures(),'REJETEE') }}</span>
                <div class="f-label-side">Rejetées<br><small>{{ pct(candidatures(),'REJETEE') | number:'1.0-1' }}%</small></div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="bottom-row">
        <!-- Recent Offers -->
        <div class="panel flex-1">
          <div class="panel-header">
            <h3>Dernières offres publiées</h3>
            <a routerLink="/admin/offres" class="link-sm">Voir tout</a>
          </div>
          <div class="panel-body no-pad">
            <div class="list-group">
              @for (offre of recentesOffres(); track offre.id) {
                <div class="list-item">
                  <div class="li-icon bg-purple-soft text-purple"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg></div>
                  <div class="li-content">
                    <div class="li-title">{{ offre.titre }}</div>
                    <div class="li-sub">{{ offre.entreprise?.nom || 'Entreprise' }}</div>
                  </div>
                  <div class="li-time">{{ offre.dateCreation | date:'dd MMM yyyy' }}</div>
                </div>
              }
              @if (recentesOffres().length === 0) {
                <div class="p-3 text-center text-muted">Aucune offre publiée.</div>
              }
            </div>
          </div>
        </div>

        <!-- Top Entreprises (Dernières inscrites) -->
        <div class="panel flex-1">
          <div class="panel-header">
            <h3>Dernières Entreprises</h3>
            <a routerLink="/admin/entreprises" class="link-sm">Voir tout</a>
          </div>
          <div class="panel-body no-pad">
            <div class="list-group">
              @for (ent of recentesEntreprises(); track ent.id) {
                <div class="list-item">
                  <div class="li-avatar bg-gray">{{ (ent.nom || 'E')[0].toUpperCase() }}</div>
                  <div class="li-content">
                    <div class="li-title-bold">{{ ent.nom }}</div>
                    <div class="li-sub">{{ ent.secteurActivite || 'Secteur non défini' }}</div>
                  </div>
                </div>
              }
              @if (recentesEntreprises().length === 0) {
                <div class="p-3 text-center text-muted">Aucune entreprise.</div>
              }
            </div>
          </div>
        </div>

        <!-- Derniers Étudiants -->
        <div class="panel flex-1">
          <div class="panel-header">
            <h3>Derniers Étudiants</h3>
            <a routerLink="/admin/etudiants" class="link-sm">Voir tout</a>
          </div>
          <div class="panel-body no-pad">
            <div class="list-group">
              @for (etu of recentsEtudiants(); track etu.id) {
                <div class="list-item">
                  <div class="li-icon-sm bg-blue-soft text-blue"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                  <div class="li-content">
                    <div class="li-title-bold">{{ etu.prenom }} {{ etu.nom }}</div>
                    <div class="li-sub">{{ etu.etablissement || 'Étudiant' }}</div>
                  </div>
                </div>
              }
              @if (recentsEtudiants().length === 0) {
                <div class="p-3 text-center text-muted">Aucun étudiant.</div>
              }
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-bottom: 2rem;
    }

    /* Header */
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-titles h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.25rem;
      letter-spacing: -0.03em;
    }
    .header-titles p {
      font-size: 0.95rem;
      color: #64748b;
    }
    .date-picker {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fff;
      border: 1px solid #e2e8f0;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .date-picker svg { color: #94a3b8; }

    /* KPI Row */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .kpi-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .kpi-content {
      display: flex;
      gap: 1rem;
      z-index: 2;
    }
    .kpi-icon-wrap {
      width: 48px; height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bg-purple { background: #f3e8ff; color: #a855f7; }
    .bg-blue { background: #eff6ff; color: #3b82f6; }
    .bg-green { background: #dcfce7; color: #22c55e; }
    .bg-orange { background: #ffedd5; color: #f59e0b; }
    .bg-red { background: #fee2e2; color: #ef4444; }

    .kpi-info { display: flex; flex-direction: column; width: 100%; }
    .kpi-label { font-size: 0.9rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; }
    .kpi-val-row { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 0.2rem; }
    .kpi-val { font-size: 1.8rem; font-weight: 800; color: #0f172a; line-height: 1; font-family: 'Plus Jakarta Sans', sans-serif; }
    .trend { font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.1rem; }
    .trend.success { color: #10b981; }
    .kpi-sub { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
    
    .kpi-sparkline {
      margin-top: 1rem;
      height: 30px;
      width: 100%;
      opacity: 0.6;
    }
    .kpi-sparkline svg { width: 100%; height: 100%; }

    /* Grids */
    .middle-row, .bottom-row {
      display: flex;
      gap: 1.25rem;
    }
    @media (max-width: 1100px) {
      .middle-row, .bottom-row { flex-direction: column; }
    }
    .flex-2 { flex: 2; min-width: 0; }
    .flex-1 { flex: 1; min-width: 0; }

    /* Panels */
    .panel {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .panel-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid transparent;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-header h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
    }
    .panel-select {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.3rem 0.6rem;
      font-size: 0.8rem;
      color: #475569;
      background: #f8fafc;
      outline: none;
    }
    .link-sm {
      font-size: 0.8rem; font-weight: 600; color: #3b82f6; text-decoration: none;
    }
    .panel-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
    .panel-body.no-pad { padding: 0; }
    .center-flex { align-items: center; justify-content: center; }

    /* Line Chart */
    .chart-body { padding: 1rem; }
    .line-chart { width: 100%; height: 100%; min-height: 250px; overflow: visible; }
    .grid line { stroke: #f1f5f9; stroke-width: 1.5; }
    .axis-labels text { fill: #94a3b8; font-size: 12px; font-weight: 500; }
    .y-axis text { text-anchor: end; }
    .x-axis text { text-anchor: middle; }

    /* Donut Chart */
    .donut-container {
      display: flex;
      align-items: center;
      gap: 2rem;
      width: 100%;
      justify-content: center;
    }
    .donut-chart {
      width: 140px; height: 140px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      box-shadow: inset 0 0 0 4px #fff;
    }
    .donut-hole {
      width: 90px; height: 90px;
      background: #fff;
      border-radius: 50%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .donut-val { font-size: 1.5rem; font-weight: 800; color: #0f172a; line-height: 1.1; }
    .donut-lbl { font-size: 0.75rem; font-weight: 600; color: #64748b; }
    .donut-legend { display: flex; flex-direction: column; gap: 1rem; }
    .legend-item { font-size: 0.85rem; font-weight: 700; color: #334155; line-height: 1.4; display: flex; align-items: flex-start; gap: 0.5rem; }
    .legend-item small { display: block; font-weight: 500; color: #64748b; font-size: 0.75rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-top: 0.25rem; flex-shrink: 0; }

    /* Funnel Chart */
    .funnel-container {
      display: flex; flex-direction: column; align-items: center; width: 100%;
      gap: 4px; padding: 1rem 0;
    }
    .funnel-tier {
      height: 44px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 1rem;
      border-radius: 4px;
      position: relative;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 10%;
    }
    .funnel-tier.bg-blue { background: #3b82f6; }
    .funnel-tier.bg-green { background: #10b981; }
    .funnel-tier.bg-orange { background: #f59e0b; }
    .funnel-tier.bg-red { background: #ef4444; }
    
    .f-label-side {
      position: absolute; left: 105%; top: 50%; transform: translateY(-50%);
      font-size: 0.8rem; font-weight: 600; color: #334155; white-space: nowrap; line-height: 1.2;
    }
    .f-label-side small { color: #64748b; font-weight: 500; }

    /* List Groups (Bottom row) */
    .list-group { display: flex; flex-direction: column; }
    .list-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .list-item:last-child { border-bottom: none; }
    .li-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .li-icon-sm { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .li-avatar { width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; color: #0f172a; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .bg-purple-soft { background: #f3e8ff; } .text-purple { color: #a855f7; }
    .bg-blue-soft { background: #eff6ff; } .text-blue { color: #3b82f6; }
    .bg-green-soft { background: #dcfce7; } .text-green { color: #22c55e; }
    .bg-red-soft { background: #fee2e2; } .text-red { color: #ef4444; }
    .bg-gray { background: #f1f5f9; color: #0f172a; }
    
    .li-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .li-title { font-size: 0.875rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .li-title-bold { font-size: 0.9rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .li-sub { font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .li-time { font-size: 0.75rem; color: #94a3b8; font-weight: 500; white-space: nowrap; }
    
    .badge-count { padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }

    .panel-footer-link {
      padding: 1rem; border-top: 1px solid #f1f5f9; text-align: center;
    }
    .panel-footer-link a {
      color: #3b82f6; font-size: 0.85rem; font-weight: 600; text-decoration: none;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private offreService       = inject(OffreStageService);
  private candidatureService = inject(CandidatureService);
  private etudiantService    = inject(EtudiantService);
  private entrepriseService  = inject(EntrepriseService);

  offres       = signal<any[]>([]);
  candidatures = signal<any[]>([]);
  etudiants    = signal<any[]>([]);
  entreprises  = signal<any[]>([]);

  today = Date.now();

  // Computed signals for lists
  recentesOffres = computed(() => {
    return [...this.offres()].slice(0, 4); // First 4 offers
  });
  
  recentesEntreprises = computed(() => {
    return [...this.entreprises()].slice(0, 4); // First 4
  });

  recentsEtudiants = computed(() => {
    return [...this.etudiants()].slice(0, 4); // First 4
  });

  ngOnInit() {
    this.offreService.getAll().subscribe({ next: d => this.offres.set(d), error: () => {} });
    this.candidatureService.getAll().subscribe({ next: d => this.candidatures.set(d), error: () => {} });
    this.etudiantService.getAll().subscribe({ next: d => this.etudiants.set(d), error: () => {} });
    this.entrepriseService.getAll().subscribe({ next: d => this.entreprises.set(d), error: () => {} });
  }

  count(list: any[], statut: string) { return list.filter(x => x.statut === statut).length; }
  pct(list: any[], statut: string) { return list.length ? (this.count(list, statut) / list.length) * 100 : 0; }

  getDonutGradient() {
    const total = this.offres().length;
    if (total === 0) return 'conic-gradient(#e2e8f0 0% 100%)';
    const ou = this.pct(this.offres(), 'OUVERTE');
    const fe = this.pct(this.offres(), 'FERMEE');
    // Using green for open, orange for closed
    return `conic-gradient(#10b981 0% ${ou}%, #f59e0b ${ou}% ${ou + fe}%, #ef4444 ${ou + fe}% 100%)`;
  }
}
