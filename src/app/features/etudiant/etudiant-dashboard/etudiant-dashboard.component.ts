import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CandidatureService } from '../../../services/candidature.service';
import { OffreStageService } from '../../../services/offre-stage.service';
import { Candidature } from '../../../models/candidature';

@Component({
  selector: 'app-etudiant-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>Bienvenue, {{ userName() }} 👋</h1>
        <p>Retrouvez toutes les offres de stage disponibles à l'Université de Labé et suivez l'avancement de vos candidatures.</p>
      </div>
      <div class="welcome-actions">
        <a routerLink="/etudiant/offres" class="btn btn-primary btn-lg" style="box-shadow:0 10px 25px rgba(0,0,0,0.3)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          Rechercher un stage
        </a>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card bg-indigo">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
          </div>
          <span class="kpi-badge">Total</span>
        </div>
        <div class="kpi-value">{{ candidatures().length }}</div>
        <div class="kpi-label">Mes Candidatures</div>
        <div class="kpi-decor"></div>
      </div>

      <div class="kpi-card bg-amber">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <span class="kpi-badge">En cours</span>
        </div>
        <div class="kpi-value">{{ enAttente() }}</div>
        <div class="kpi-label">En Attente de réponse</div>
        <div class="kpi-decor"></div>
      </div>

      <div class="kpi-card bg-emerald">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <span class="kpi-badge">Retenues</span>
        </div>
        <div class="kpi-value">{{ acceptees() }}</div>
        <div class="kpi-label">Candidatures Acceptées</div>
        <div class="kpi-decor"></div>
      </div>

      <div class="kpi-card bg-danger">
        <div class="kpi-top">
          <div class="kpi-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </div>
          <span class="kpi-badge">Refusées</span>
        </div>
        <div class="kpi-value">{{ rejetees() }}</div>
        <div class="kpi-label">Candidatures Non retenues</div>
        <div class="kpi-decor"></div>
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
    .kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.25rem; margin-bottom:2rem; }
    .kpi-card { 
      display:flex; flex-direction:column; padding:1.5rem; border-radius:20px; color:white; position:relative; overflow:hidden; 
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
      transition:transform 0.25s, box-shadow 0.25s; 
      &:hover{ transform:translateY(-4px); box-shadow:0 15px 35px rgba(0,0,0,0.18); } 
    }

    .bg-indigo { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .bg-emerald{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .bg-amber  { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .bg-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

    .kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .kpi-icon { width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; }
    .kpi-badge { font-size:0.75rem; font-weight:700; background:rgba(255,255,255,0.22); padding:0.25rem 0.65rem; border-radius:9999px; }
    .kpi-value { font-size:2.25rem; font-weight:800; line-height:1; margin-bottom:0.35rem; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-0.03em; }
    .kpi-label { font-size:0.78rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; opacity:0.85; }
    .kpi-decor { position:absolute; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.07); bottom:-25px; right:-25px; pointer-events:none; }
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
