import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { OffreStageService } from '../../../services/offre-stage.service';
import { CandidatureService } from '../../../services/candidature.service';
import { EtudiantService } from '../../../services/etudiant.service';
import { EntrepriseService } from '../../../services/entreprise.service';

@Component({
  selector: 'app-admin-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Analytics & Rapports</h1>
        <p class="page-subtitle">Vue détaillée et performances de la plateforme UniStage</p>
      </div>
    </div>

    <!-- Top KPI Row -->
    <div class="stat-kpi-grid">
      <div class="stat-kpi-card">
        <div class="kpi-icon-bx" style="color:#6366f1; background:#eef2ff; border-color:#e0e7ff;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
        </div>
        <div class="kpi-data">
          <div class="kpi-val">{{ etudiants().length }}</div>
          <div class="kpi-lbl">Total Étudiants</div>
        </div>
      </div>
      
      <div class="stat-kpi-card">
        <div class="kpi-icon-bx" style="color:#0ea5e9; background:#f0f9ff; border-color:#e0f2fe;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12z"/></svg>
        </div>
        <div class="kpi-data">
          <div class="kpi-val">{{ entreprises().length }}</div>
          <div class="kpi-lbl">Total Entreprises</div>
        </div>
      </div>
      
      <div class="stat-kpi-card">
        <div class="kpi-icon-bx" style="color:#10b981; background:#ecfdf5; border-color:#d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <div class="kpi-data">
          <div class="kpi-val">{{ offres().length }}</div>
          <div class="kpi-lbl">Offres Publiées</div>
        </div>
      </div>
      
      <div class="stat-kpi-card">
        <div class="kpi-icon-bx" style="color:#f59e0b; background:#fffbeb; border-color:#fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
        </div>
        <div class="kpi-data">
          <div class="kpi-val">{{ candidatures().length }}</div>
          <div class="kpi-lbl">Total Candidatures</div>
        </div>
      </div>
    </div>

    <!-- Detailed Stats Row -->
    <div class="stat-panels">
      
      <!-- Offres Panel -->
      <div class="stat-panel">
        <div class="panel-head">
          <h4>Performance des Offres</h4>
        </div>
        <div class="panel-body">
          <div class="dual-metric">
            <div class="metric">
              <span class="m-val success">{{ offresOuvertes() }}</span>
              <span class="m-lbl">Actives</span>
            </div>
            <div class="metric">
              <span class="m-val gray">{{ offresFermees() }}</span>
              <span class="m-lbl">Clôturées</span>
            </div>
          </div>
          <div class="prog-container">
            <div class="prog-bar"><div class="prog-fill" [style.width.%]="offresOuvertesPct()"></div></div>
            <div class="prog-txt">Taux d'ouverture : {{ offresOuvertesPct() | number:'1.0-0' }}%</div>
          </div>
        </div>
      </div>

      <!-- Candidatures Panel -->
      <div class="stat-panel">
        <div class="panel-head">
          <h4>Répartition des Candidatures</h4>
        </div>
        <div class="panel-body">
          <div class="c-bar-list">
            <div class="c-bar-row">
              <div class="c-bar-name"><span class="c-dot" style="background:#f59e0b"></span> En attente</div>
              <div class="c-bar-track"><div class="c-bar-fill" style="background:#f59e0b" [style.width.%]="candPct('EN_ATTENTE')"></div></div>
              <div class="c-bar-num">{{ candCount('EN_ATTENTE') }}</div>
            </div>
            <div class="c-bar-row">
              <div class="c-bar-name"><span class="c-dot" style="background:#10b981"></span> Acceptées</div>
              <div class="c-bar-track"><div class="c-bar-fill" style="background:#10b981" [style.width.%]="candPct('ACCEPTEE')"></div></div>
              <div class="c-bar-num">{{ candCount('ACCEPTEE') }}</div>
            </div>
            <div class="c-bar-row">
              <div class="c-bar-name"><span class="c-dot" style="background:#ef4444"></span> Rejetées</div>
              <div class="c-bar-track"><div class="c-bar-fill" style="background:#ef4444" [style.width.%]="candPct('REJETEE')"></div></div>
              <div class="c-bar-num">{{ candCount('REJETEE') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Taux de succès Panel -->
      <div class="stat-panel">
        <div class="panel-head">
          <h4>Taux d'Acceptation Global</h4>
        </div>
        <div class="panel-body">
          <div class="success-rate-wrap">
            <div class="sr-circle">
              <svg viewBox="0 0 36 36" class="sr-svg">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#34d399" />
                  </linearGradient>
                </defs>
                <path class="sr-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="sr-fg" [style.strokeDasharray]="successRate() + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <div class="sr-text">
                <span class="sr-val">{{ successRate() | number:'1.0-0' }}%</span>
                <span class="sr-lbl">Validées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display:block; }
    
    /* Top KPI Row */
    .stat-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .stat-kpi-card { 
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 1.5rem; display:flex; align-items:center; gap:1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      transition: all 0.2s;
    }
    .stat-kpi-card:hover { border-color: #cbd5e1; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); transform:translateY(-2px); }
    .kpi-icon-bx { 
      width: 52px; height: 52px; border-radius: 14px;
      display:flex; align-items:center; justify-content:center;
      border: 1px solid transparent;
    }
    .kpi-data { flex:1; }
    .kpi-val { font-size: 1.85rem; font-weight: 800; color: #0f172a; line-height: 1; font-family:'Plus Jakarta Sans', sans-serif; letter-spacing:-0.03em; }
    .kpi-lbl { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.35rem; }

    /* Detailed Stats Row */
    .stat-panels { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1.5rem; }
    .stat-panel { 
      background: white; border: 1px solid #e2e8f0; border-radius: 16px; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      display:flex; flex-direction:column;
    }
    .panel-head { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .panel-head h4 { font-size: 1.05rem; font-weight: 800; color: #1e293b; margin:0; }
    .panel-body { padding: 1.75rem 1.5rem; flex:1; display:flex; flex-direction:column; }
    
    /* Performance Offres */
    .dual-metric { display:flex; gap:3rem; justify-content:center; margin-bottom:2rem; flex:1; align-items:center; }
    .metric { text-align:center; }
    .m-val { font-size: 2.75rem; font-weight: 800; line-height:1; display:block; font-family:'Plus Jakarta Sans', sans-serif; letter-spacing:-0.03em; }
    .m-val.success { color: #10b981; }
    .m-val.gray { color: #94a3b8; }
    .m-lbl { font-size: 0.85rem; font-weight: 600; color: #64748b; margin-top:0.6rem; display:block; text-transform:uppercase; letter-spacing:0.04em; }
    
    .prog-container { margin-top: auto; }
    .prog-bar { height: 10px; background: #f1f5f9; border-radius: 99px; overflow:hidden; margin-bottom: 0.6rem; }
    .prog-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 99px; transition: width 1s ease-out; }
    .prog-txt { font-size: 0.8rem; color: #64748b; text-align: right; font-weight: 600; }
    
    /* Candidate Bars */
    .c-bar-list { display:flex; flex-direction:column; gap: 1.5rem; flex:1; justify-content:center; }
    .c-bar-row { display:flex; align-items:center; gap: 1rem; }
    .c-bar-name { width: 95px; font-size: 0.85rem; font-weight: 600; color: #475569; display:flex; align-items:center; gap:0.6rem; }
    .c-bar-track { flex:1; height: 12px; background: #f1f5f9; border-radius: 99px; overflow:hidden; }
    .c-bar-fill { height: 100%; border-radius: 99px; transition: width 1s ease-out; }
    .c-bar-num { width: 35px; text-align:right; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
    .c-dot { width:10px; height:10px; border-radius:50%; }

    /* Success Rate */
    .success-rate-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; }
    .sr-circle { position:relative; width:160px; height:160px; }
    .sr-svg { transform:rotate(-90deg); width:100%; height:100%; }
    .sr-bg { fill:none; stroke:#f1f5f9; stroke-width:3.5; }
    .sr-fg { fill:none; stroke:url(#grad); stroke-width:3.5; stroke-linecap:round; transition:stroke-dasharray 1.2s ease-out; }
    .sr-text { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .sr-val { font-size: 2.5rem; font-weight: 800; color: #0f172a; font-family:'Plus Jakarta Sans',sans-serif; line-height:1; letter-spacing:-0.03em; }
    .sr-lbl { font-size: 0.8rem; color: #64748b; font-weight:700; margin-top:0.4rem; text-transform:uppercase; letter-spacing:0.04em; }
  `]
})
export class AdminStatsComponent implements OnInit {
  private offreSvc     = inject(OffreStageService);
  private candSvc      = inject(CandidatureService);
  private etudiantSvc  = inject(EtudiantService);
  private entrepriseSvc = inject(EntrepriseService);

  offres       = signal<any[]>([]);
  candidatures = signal<any[]>([]);
  etudiants    = signal<any[]>([]);
  entreprises  = signal<any[]>([]);

  offresOuvertes   = computed(() => this.offres().filter(o => o.statut === 'OUVERTE').length);
  offresFermees    = computed(() => this.offres().filter(o => o.statut === 'FERMEE').length);
  offresOuvertesPct = computed(() => this.offres().length ? (this.offresOuvertes() / this.offres().length) * 100 : 0);

  candCount(s: string) { return this.candidatures().filter(c => c.statut === s).length; }
  candPct(s: string)   { return this.candidatures().length ? (this.candCount(s) / this.candidatures().length) * 100 : 0; }
  successRate = computed(() => this.candidatures().length ? (this.candCount('ACCEPTEE') / this.candidatures().length) * 100 : 0);

  ngOnInit() {
    this.offreSvc.getAll().subscribe({ next: d => this.offres.set(d), error: () => {} });
    this.candSvc.getAll().subscribe({ next: d => this.candidatures.set(d), error: () => {} });
    this.etudiantSvc.getAll().subscribe({ next: d => this.etudiants.set(d), error: () => {} });
    this.entrepriseSvc.getAll().subscribe({ next: d => this.entreprises.set(d), error: () => {} });
  }
}
