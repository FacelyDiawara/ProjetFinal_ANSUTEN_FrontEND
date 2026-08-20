import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CandidatureService } from '../../../services/candidature.service';
import { Candidature } from '../../../models/candidature';

@Component({
  selector: 'app-etudiant-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="student-banner">
      <div class="student-content">
        <h1>Bienvenue, {{ userName() }}</h1>
        <p>Suivez vos candidatures et explorez les offres de stage disponibles.</p>
      </div>
      <div class="student-actions">
        <a routerLink="/etudiant/offres" class="banner-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          Rechercher un stage
        </a>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="student-kpi-grid">
      <!-- Total -->
      <div class="student-kpi-card active">
        <div class="skpi-icon" style="background:#eef2ff; color:#6366f1;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v1H8v-1zm0-3h8v1H8v-1zm0-3h5v1H8v-1z"/></svg>
        </div>
        <div class="skpi-content">
          <div class="skpi-val">{{ candidatures().length }}</div>
          <div class="skpi-title">Mes Candidatures</div>
        </div>
      </div>

      <!-- En attente -->
      <div class="student-kpi-card">
        <div class="skpi-icon" style="background:#fffbeb; color:#f59e0b;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M11 7h2v6h-2zm0 8h2v2h-2z" fill="#fff"/></svg>
        </div>
        <div class="skpi-content">
          <div class="skpi-val">{{ enAttente() }}</div>
          <div class="skpi-title">En attente</div>
        </div>
      </div>

      <!-- Acceptées -->
      <div class="student-kpi-card">
        <div class="skpi-icon" style="background:#ecfdf5; color:#10b981;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#fff"/></svg>
        </div>
        <div class="skpi-content">
          <div class="skpi-val">{{ acceptees() }}</div>
          <div class="skpi-title">Acceptées</div>
        </div>
      </div>

      <!-- Rejetées -->
      <div class="student-kpi-card">
        <div class="skpi-icon" style="background:#fef2f2; color:#ef4444;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M15.53 7.47L12 11l-3.53-3.53-1.06 1.06L11 12l-3.53 3.53 1.06 1.06L12 13l3.53 3.53 1.06-1.06L13 12l3.53-3.53-1.06-1.06z" fill="#fff"/></svg>
        </div>
        <div class="skpi-content">
          <div class="skpi-val">{{ rejetees() }}</div>
          <div class="skpi-title">Non retenues</div>
        </div>
      </div>
    </div>

    <!-- Analytics Row -->
    <div class="analytics-row">
      <!-- Donut Chart -->
      <div class="analytics-card donut-card">
        <div class="analytics-header">
          <div>
            <h3 class="analytics-title">Répartition</h3>
            <p class="analytics-sub">Statuts de vos candidatures</p>
          </div>
        </div>
        <div class="donut-area">
          <svg viewBox="0 0 220 220" width="200" height="200" role="img" aria-label="Donut chart des candidatures">
            <!-- Track -->
            <circle cx="110" cy="110" r="80" fill="none" stroke="#f1f5f9" stroke-width="22"/>
            @if (candidatures().length === 0) {
              <circle cx="110" cy="110" r="80" fill="none" stroke="#e2e8f0" stroke-width="22" stroke-dasharray="502.65 502.65"/>
            } @else {
              <circle cx="110" cy="110" r="80" fill="none" stroke="#6366f1" stroke-width="22"
                [attr.stroke-dasharray]="seg(candidatures().length - enAttente() - acceptees() - rejetees(), candidatures().length)"
                [attr.stroke-dashoffset]="off(0)"
                transform="rotate(-90 110 110)"/>
              <circle cx="110" cy="110" r="80" fill="none" stroke="#f59e0b" stroke-width="22"
                [attr.stroke-dasharray]="seg(enAttente(), candidatures().length)"
                [attr.stroke-dashoffset]="off(candidatures().length - enAttente() - acceptees() - rejetees())"
                transform="rotate(-90 110 110)"/>
              <circle cx="110" cy="110" r="80" fill="none" stroke="#10b981" stroke-width="22"
                [attr.stroke-dasharray]="seg(acceptees(), candidatures().length)"
                [attr.stroke-dashoffset]="off(candidatures().length - acceptees() - rejetees())"
                transform="rotate(-90 110 110)"/>
              <circle cx="110" cy="110" r="80" fill="none" stroke="#ef4444" stroke-width="22"
                [attr.stroke-dasharray]="seg(rejetees(), candidatures().length)"
                [attr.stroke-dashoffset]="off(candidatures().length - rejetees())"
                transform="rotate(-90 110 110)"/>
            }
            <!-- Center text -->
            <text x="110" y="103" text-anchor="middle" font-size="32" font-weight="800" fill="#0f172a" font-family="Inter,sans-serif">{{ candidatures().length }}</text>
            <text x="110" y="124" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="Inter,sans-serif" letter-spacing="1">TOTAL</text>
          </svg>
        </div>
        <div class="donut-chips">
          <div class="chip"><span class="chip-dot" style="background:#f59e0b"></span>En attente <b>{{ enAttente() }}</b></div>
          <div class="chip"><span class="chip-dot" style="background:#10b981"></span>Acceptées <b>{{ acceptees() }}</b></div>
          <div class="chip"><span class="chip-dot" style="background:#ef4444"></span>Refusées <b>{{ rejetees() }}</b></div>
        </div>
      </div>

      <!-- Progress Bars -->
      <div class="analytics-card bars-card">
        <div class="analytics-header">
          <div>
            <h3 class="analytics-title">Taux de succès</h3>
            <p class="analytics-sub">Analyse de vos candidatures</p>
          </div>
        </div>
        <div class="bars-list">
          <div class="bar-row">
            <div class="bar-meta">
              <span class="bar-label">En attente de réponse</span>
              <span class="bar-pct" style="color:#f59e0b">{{ pct(enAttente()) }}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="background:linear-gradient(90deg,#f59e0b,#fbbf24)" [style.width.%]="pct(enAttente())"></div>
            </div>
            <span class="bar-count">{{ enAttente() }} candidature{{ enAttente() > 1 ? 's' : '' }}</span>
          </div>
          <div class="bar-row">
            <div class="bar-meta">
              <span class="bar-label">Candidatures acceptées</span>
              <span class="bar-pct" style="color:#10b981">{{ pct(acceptees()) }}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="background:linear-gradient(90deg,#10b981,#34d399)" [style.width.%]="pct(acceptees())"></div>
            </div>
            <span class="bar-count">{{ acceptees() }} candidature{{ acceptees() > 1 ? 's' : '' }}</span>
          </div>
          <div class="bar-row">
            <div class="bar-meta">
              <span class="bar-label">Candidatures refusées</span>
              <span class="bar-pct" style="color:#ef4444">{{ pct(rejetees()) }}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="background:linear-gradient(90deg,#ef4444,#f87171)" [style.width.%]="pct(rejetees())"></div>
            </div>
            <span class="bar-count">{{ rejetees() }} candidature{{ rejetees() > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <div class="success-score">
          <div class="score-label">Score de succès</div>
          <div class="score-value" style="color:#10b981">
            {{ candidatures().length > 0 ? pct(acceptees()) : 0 }}%
          </div>
          <div class="score-desc">des candidatures acceptées</div>
        </div>
      </div>
    </div>

    <!-- Recent Applications Table -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3>Suivi de vos Candidatures Récents</h3>
          <p class="text-muted" style="font-size:0.8rem">Historique des candidatures que vous avez soumises</p>
        </div>
        <a routerLink="/etudiant/candidatures" class="btn btn-ghost btn-sm">Voir tout le suivi →</a>
      </div>
      <div class="card-body" style="padding:0">
        @if (loading()) {
          <div style="padding:3rem;text-align:center"><div class="spinner spinner-dark"></div></div>
        } @else if (candidatures().length === 0) {
          <div class="empty-state" style="padding:3rem">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <h3>Vous n'avez pas encore postulé</h3>
            <p>Découvrez dès maintenant les offres de stage disponibles pour postuler en un clic.</p>
            <a routerLink="/etudiant/offres" class="btn btn-primary mt-3">Explorer les offres</a>
          </div>
        } @else {
          <div class="table-container" style="border:none; box-shadow:none;">
            <table class="table">
              <thead>
                <tr>
                  <th>Intitulé de l'Offre</th>
                  <th>Entreprise Partner</th>
                  <th>Date de Soumission</th>
                  <th>Statut de la demande</th>
                </tr>
              </thead>
              <tbody>
                @for (c of candidatures().slice(0,5); track c.id) {
                  <tr>
                    <td><strong style="color:#0f172a">{{ c.offreStage?.titre ?? 'Offre de stage' }}</strong></td>
                    <td>{{ c.offreStage?.entreprise?.raisonSociale ?? 'Entreprise' }}</td>
                    <td style="font-size:0.825rem;color:#64748b">{{ c.dateSoumission?.slice(0,10) ?? '—' }}</td>
                    <td><span class="badge" [class]="badgeClass(c.statut)">{{ label(c.statut) }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* ── Student Dashboard Specific Styles ── */
    .student-banner {
      background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #4f46e5 100%);
      border-radius: 16px;
      padding: 1.25rem 2rem;
      color: white;
      position: relative;
      overflow: hidden;
      margin-bottom: 1.5rem;
      box-shadow: 0 8px 20px -5px rgba(59, 130, 246, 0.35);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .student-banner::after {
      content: ''; position: absolute; right: -50px; bottom: -80px; width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%);
      border-radius: 50%; pointer-events: none;
    }
    .student-banner::before {
      content: ''; position: absolute; left: 10%; top: -80px; width: 180px; height: 180px;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
      border-radius: 50%; pointer-events: none;
    }
    .student-content { position: relative; z-index: 1; }
    .student-content h1 { font-size: 1.4rem; font-weight: 800; color: white; margin-bottom: 0.15rem; text-shadow: 0 1px 3px rgba(0,0,0,0.1); letter-spacing:-0.02em; }
    .student-content p { font-size: 0.85rem; color: rgba(255,255,255,0.85); max-width: 480px; font-weight: 400; line-height:1.4; margin:0; }
    .student-actions { position: relative; z-index: 1; }
    .banner-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1.25rem; border-radius: 8px;
      background: white; color: #3b82f6; font-weight: 700; font-size: 0.85rem;
      text-decoration: none; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .banner-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }

    /* ── KPI Cards ── */
    .student-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:2.5rem; }
    .student-kpi-card {
      background: #fff; border-radius: 12px; padding: 1rem 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      border: 1px solid #f1f5f9;
      display: flex; flex-direction: row; align-items: center; gap: 1rem;
      position: relative; overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .student-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.05); border-color:#e2e8f0; }
    .student-kpi-card.active { border-bottom: 3px solid #6366f1; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
    
    .skpi-icon {
      width: 42px; height: 42px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .skpi-icon svg { width: 22px; height: 22px; }
    
    .skpi-content { display: flex; flex-direction: column; justify-content: center; }
    .skpi-val { font-size: 1.7rem; font-weight: 800; color: #0f172a; line-height: 1.1; font-family:'Plus Jakarta Sans',sans-serif; }
    .skpi-title { font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform:uppercase; letter-spacing:0.03em; margin-top: 0.15rem; }

    /* ── Analytics Row ── */
    .analytics-row { display:grid; grid-template-columns:1fr 1.6fr; gap:1rem; margin-bottom:1.5rem; }
    @media(max-width:768px){ .analytics-row { grid-template-columns:1fr; } }
    .analytics-card {
      background:#fff; border-radius:16px; border:1px solid #f1f5f9;
      box-shadow:0 2px 12px rgba(0,0,0,0.06); padding:1.5rem;
    }
    .analytics-header { margin-bottom:1rem; }
    .analytics-title { font-size:0.95rem; font-weight:700; color:#0f172a; margin:0; }
    .analytics-sub { font-size:0.75rem; color:#94a3b8; margin:0.2rem 0 0; }

    /* Donut */
    .donut-area { display:flex; justify-content:center; margin:0.5rem 0; }
    .donut-chips { display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center; }
    .chip { display:flex; align-items:center; gap:0.4rem; font-size:0.78rem; color:#475569; background:#f8fafc; border:1px solid #e2e8f0; padding:0.3rem 0.7rem; border-radius:9999px; }
    .chip-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .chip b { color:#0f172a; font-weight:700; }

    /* Bars */
    .bars-list { display:flex; flex-direction:column; gap:1.4rem; }
    .bar-row {}
    .bar-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem; }
    .bar-label { font-size:0.8rem; font-weight:500; color:#475569; }
    .bar-pct { font-size:0.8rem; font-weight:700; }
    .bar-track { height:8px; background:#f1f5f9; border-radius:9999px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:9999px; transition:width 0.8s cubic-bezier(0.4,0,0.2,1); }
    .bar-count { font-size:0.72rem; color:#94a3b8; margin-top:0.3rem; display:block; }

    .success-score {
      margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid #f1f5f9;
      display:flex; align-items:center; gap:1rem;
    }
    .score-label { font-size:0.78rem; color:#64748b; font-weight:500; flex:1; }
    .score-value { font-size:1.6rem; font-weight:800; font-family:'Inter',sans-serif; letter-spacing:-0.03em; }
    .score-desc { font-size:0.72rem; color:#94a3b8; }
  `]
})
export class EtudiantDashboardComponent implements OnInit {
  protected auth = inject(AuthService);
  private candSvc = inject(CandidatureService);

  candidatures = signal<Candidature[]>([]);
  loading = signal(true);

  enAttente = computed(() => this.candidatures().filter(c => c.statut === 'EN_ATTENTE').length);
  acceptees = computed(() => this.candidatures().filter(c => c.statut === 'ACCEPTEE').length);
  rejetees  = computed(() => this.candidatures().filter(c => c.statut === 'REJETEE').length);

  private readonly C = 2 * Math.PI * 80; // circumference for r=80

  seg(count: number, total: number): string {
    if (total === 0) return `0 ${this.C}`;
    return `${(count / total) * this.C} ${this.C}`;
  }

  off(preceding: number): string {
    const total = this.candidatures().length;
    if (total === 0) return '0';
    return `${-(preceding / total) * this.C}`;
  }

  pct(count: number): number {
    const total = this.candidatures().length;
    return total === 0 ? 0 : Math.round((count / total) * 100);
  }

  userName() { const u = this.auth.currentUser(); return u ? `${u.prenom} ${u.nom}` : 'Étudiant'; }

  badgeClass(s: string) { return { EN_ATTENTE: 'badge-warning', ACCEPTEE: 'badge-success', REJETEE: 'badge-danger' }[s] ?? 'badge-gray'; }
  label(s: string) { return { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REJETEE: 'Rejetée' }[s] ?? s; }

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user?.id) {
      this.candSvc.getByEtudiant(user.id).subscribe({
        next: d => { this.candidatures.set(d); this.loading.set(false); },
        error: () => { this.candSvc.getAll().subscribe({ next: d => { this.candidatures.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
      });
    } else { this.loading.set(false); }
  }
}
