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
        <h1 class="page-title">Statistiques</h1>
        <p class="page-subtitle">Analyse globale de la plateforme UniStage</p>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">
        <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg></div>
        <div class="kpi-value">{{ etudiants().length }}</div>
        <div class="kpi-label">Étudiants</div>
        <div class="kpi-decor"></div>
      </div>
      <div class="kpi-card" style="background:linear-gradient(135deg,#06b6d4,#0891b2)">
        <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 7V3H2v18h20V7H12z"/></svg></div>
        <div class="kpi-value">{{ entreprises().length }}</div>
        <div class="kpi-label">Entreprises</div>
        <div class="kpi-decor"></div>
      </div>
      <div class="kpi-card" style="background:linear-gradient(135deg,#10b981,#059669)">
        <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg></div>
        <div class="kpi-value">{{ offres().length }}</div>
        <div class="kpi-label">Offres totales</div>
        <div class="kpi-decor"></div>
      </div>
      <div class="kpi-card" style="background:linear-gradient(135deg,#f59e0b,#d97706)">
        <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg></div>
        <div class="kpi-value">{{ candidatures().length }}</div>
        <div class="kpi-label">Candidatures totales</div>
        <div class="kpi-decor"></div>
      </div>
    </div>

    <div class="stats-grid">
      <!-- Offres -->
      <div class="card">
        <div class="card-header"><h3>Offres de stage</h3></div>
        <div class="card-body">
          <div class="stat-row">
            <div class="stat-item">
              <div class="stat-circle" style="--c:#10b981">{{ offresOuvertes() }}</div>
              <span>Ouvertes</span>
            </div>
            <div class="stat-item">
              <div class="stat-circle" style="--c:#6b7280">{{ offresFermees() }}</div>
              <span>Fermées</span>
            </div>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar">
              <div class="progress-fill success" [style.width.%]="offresOuvertesPct()"></div>
            </div>
            <span class="progress-label">{{ offresOuvertesPct() | number:'1.0-0' }}% ouvertes</span>
          </div>
        </div>
      </div>

      <!-- Candidatures -->
      <div class="card">
        <div class="card-header"><h3>Candidatures</h3></div>
        <div class="card-body">
          <div class="cand-bars">
            <div class="bar-item">
              <span class="bar-lbl"><span class="dot" style="background:#f59e0b"></span>En attente</span>
              <div class="bar-track"><div class="bar-fill" style="background:#f59e0b" [style.width.%]="candPct('EN_ATTENTE')"></div></div>
              <span class="bar-num">{{ candCount('EN_ATTENTE') }}</span>
            </div>
            <div class="bar-item">
              <span class="bar-lbl"><span class="dot" style="background:#10b981"></span>Acceptées</span>
              <div class="bar-track"><div class="bar-fill" style="background:#10b981" [style.width.%]="candPct('ACCEPTEE')"></div></div>
              <span class="bar-num">{{ candCount('ACCEPTEE') }}</span>
            </div>
            <div class="bar-item">
              <span class="bar-lbl"><span class="dot" style="background:#ef4444"></span>Rejetées</span>
              <div class="bar-track"><div class="bar-fill" style="background:#ef4444" [style.width.%]="candPct('REJETEE')"></div></div>
              <span class="bar-num">{{ candCount('REJETEE') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Taux de succès -->
      <div class="card">
        <div class="card-header"><h3>Taux de succès</h3></div>
        <div class="card-body">
          <div class="rate-display">
            <div class="rate-circle">
              <svg viewBox="0 0 36 36" class="rate-svg">
                <path class="rate-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="rate-fg" [style.strokeDasharray]="successRate() + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <div class="rate-text">{{ successRate() | number:'1.0-0' }}%</div>
            </div>
            <p class="rate-desc">des candidatures ont été acceptées</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .kpi-card { display:flex; flex-direction:column; padding:1.25rem; border-radius:16px; color:white; position:relative; overflow:hidden; }
    .kpi-icon { width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; margin-bottom:0.75rem; }
    .kpi-value { font-size:2rem; font-weight:800; line-height:1; margin-bottom:0.2rem; }
    .kpi-label { font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8; }
    .kpi-decor { position:absolute; width:70px; height:70px; border-radius:50%; background:rgba(255,255,255,0.08); bottom:-15px; right:-15px; }
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1rem; }
    .stat-row { display:flex; justify-content:center; gap:2rem; margin-bottom:1rem; }
    .stat-item { display:flex; flex-direction:column; align-items:center; gap:0.5rem; font-size:0.8rem; color:#6b7280; font-weight:500; }
    .stat-circle { width:64px; height:64px; border-radius:50%; background:color-mix(in srgb, var(--c) 12%, transparent); border:3px solid var(--c); display:flex; align-items:center; justify-content:center; font-size:1.4rem; font-weight:800; color:var(--c); }
    .progress-bar-wrap { display:flex; flex-direction:column; gap:0.375rem; }
    .progress-bar { height:8px; background:#f3f4f6; border-radius:9999px; overflow:hidden; }
    .progress-fill { height:100%; border-radius:9999px; transition:width 1s ease; &.success { background:#10b981; } }
    .progress-label { font-size:0.75rem; color:#6b7280; text-align:right; }
    .cand-bars { display:flex; flex-direction:column; gap:1rem; }
    .bar-item { display:flex; align-items:center; gap:0.75rem; }
    .bar-lbl { display:flex; align-items:center; gap:0.375rem; font-size:0.8rem; color:#4b5563; font-weight:500; min-width:90px; }
    .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .bar-track { flex:1; height:8px; background:#f3f4f6; border-radius:9999px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:9999px; transition:width 0.8s ease; }
    .bar-num { font-size:0.8rem; font-weight:700; color:#374151; min-width:22px; text-align:right; }
    .rate-display { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:1rem 0; }
    .rate-circle { position:relative; width:100px; height:100px; }
    .rate-svg { transform:rotate(-90deg); width:100%; height:100%; }
    .rate-bg { fill:none; stroke:#f3f4f6; stroke-width:3.8; }
    .rate-fg { fill:none; stroke:#10b981; stroke-width:3.8; stroke-linecap:round; transition:stroke-dasharray 1s ease; }
    .rate-text { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:1.25rem; font-weight:800; color:#111827; }
    .rate-desc { font-size:0.8rem; color:#6b7280; text-align:center; }
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
