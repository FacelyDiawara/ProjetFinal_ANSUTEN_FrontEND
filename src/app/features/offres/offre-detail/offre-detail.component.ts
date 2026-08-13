import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffreStageService } from '../../../services/offre-stage.service';
import { CandidatureService } from '../../../services/candidature.service';
import { AuthService } from '../../../services/auth.service';
import { OffreStage } from '../../../models/offre-stage';

@Component({
  selector: 'app-offre-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    @if (loading()) {
      <div class="loading-wrap"><div class="spinner" style="width:40px;height:40px"></div></div>
    } @else if (!offre()) {
      <div class="empty-state">
        <h3>Offre introuvable</h3>
        <a routerLink="/" class="btn btn-primary" style="margin-top:1rem">Retour à l'accueil</a>
      </div>
    } @else {
      <div class="detail-layout">
        <!-- Main -->
        <div class="detail-main">
          <div class="back-row">
            <a [routerLink]="backRoute()" class="back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Retour
            </a>
          </div>

          <div class="offer-hero card">
            <div class="offer-hero-top">
              <div class="company-logo">{{ companyInitial() }}</div>
              <div>
                <h1>{{ offre()!.titre }}</h1>
                <p class="company-name">{{ offre()!.entreprise?.raisonSociale ?? 'Entreprise partenaire' }}</p>
              </div>
              <span class="badge" [class]="offre()!.statut === 'OUVERTE' ? 'badge-success' : 'badge-gray'">
                {{ offre()!.statut === 'OUVERTE' ? 'Ouverte' : 'Fermée' }}
              </span>
            </div>

            <div class="offer-tags">
              @if (offre()!.lieu) { <span class="info-chip">📍 {{ offre()!.lieu }}</span> }
              @if (offre()!.dateDebut) { <span class="info-chip">📅 Du {{ offre()!.dateDebut | date:'dd/MM/yyyy' }}</span> }
              @if (offre()!.dateFin) { <span class="info-chip">⏰ Au {{ offre()!.dateFin | date:'dd/MM/yyyy' }}</span> }
              @if (offre()!.duree) { <span class="info-chip">⌛ {{ offre()!.duree }} mois</span> }
            </div>
          </div>

          <div class="card" style="margin-top:1rem">
            <div class="card-header"><h3>Description du poste</h3></div>
            <div class="card-body">
              <p class="desc-text">{{ offre()!.description }}</p>
            </div>
          </div>

          <div class="card" style="margin-top:1rem">
            <div class="card-header"><h3>Compétences requises</h3></div>
            <div class="card-body">
              <div class="skills-wrap">
                @for (skill of skills(); track skill) {
                  <span class="skill-tag">{{ skill }}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="detail-aside">
          @if (auth.isEtudiant()) {
            <div class="card apply-card">
              <h3>Postuler à cette offre</h3>
              @if (offre()!.statut !== 'OUVERTE') {
                <p class="closed-notice">Cette offre est actuellement fermée.</p>
              } @else {
                @if (postuleSuccess()) {
                  <div class="alert alert-success" role="status">{{ postuleSuccess() }}</div>
                } @else {
                  <div class="form-group" style="margin-bottom:1rem">
                    <label class="form-label" for="lettre">Lettre de motivation *</label>
                    <textarea id="lettre" class="form-control" rows="6" [(ngModel)]="lettreMotivation"
                      placeholder="Bonjour, je souhaite postuler car..." aria-label="Lettre de motivation"></textarea>
                  </div>
                  @if (postuleError()) {
                    <p class="form-error" style="margin-bottom:0.75rem">{{ postuleError() }}</p>
                  }
                  <button class="btn btn-primary w-full" (click)="postuler()" [disabled]="postuleLoading()">
                    @if (postuleLoading()) { <span class="spinner"></span> }
                    Envoyer ma candidature
                  </button>
                }
              }
            </div>
          } @else if (!auth.isLoggedIn()) {
            <div class="card apply-card">
              <h3>Intéressé par cette offre ?</h3>
              <p style="color:#6b7280;font-size:0.875rem;margin-bottom:1rem">Connectez-vous pour postuler.</p>
              <a routerLink="/auth/login" class="btn btn-primary w-full">Se connecter</a>
              <a routerLink="/auth/register" class="btn btn-outline w-full" style="margin-top:0.5rem">Créer un compte</a>
            </div>
          }

          <div class="card" style="margin-top:1rem">
            <div class="card-header"><h3>À propos</h3></div>
            <div class="card-body">
              <dl class="info-list">
                <dt>Entreprise</dt><dd>{{ offre()!.entreprise?.raisonSociale ?? '—' }}</dd>
                <dt>Secteur</dt><dd>{{ offre()!.entreprise?.secteurActivite ?? '—' }}</dd>
                <dt>Lieu</dt><dd>{{ offre()!.lieu ?? '—' }}</dd>
              </dl>
            </div>
          </div>
        </aside>
      </div>
    }
  `,
  styles: [`
    :host { display:block; }
    .loading-wrap { display:flex; align-items:center; justify-content:center; height:50dvh; }
    .w-full { width:100%; justify-content:center; }
    .detail-layout { display:grid; grid-template-columns:1fr 340px; gap:1.5rem; align-items:start; }
    @media (max-width:900px) { .detail-layout { grid-template-columns:1fr; } }
    .back-link { display:inline-flex; align-items:center; gap:0.375rem; color:#6b7280; font-size:0.875rem; font-weight:500; text-decoration:none; margin-bottom:1rem; &:hover { color:#4f46e5; } }
    .offer-hero { padding:1.5rem; }
    .offer-hero-top { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1rem; flex-wrap:wrap;
      h1 { font-size:1.35rem; font-weight:800; color:#111827; margin-bottom:0.2rem; }
    }
    .company-logo { width:56px; height:56px; border-radius:14px; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; color:white; font-size:1.4rem; font-weight:800; flex-shrink:0; }
    .company-name { color:#6b7280; font-size:0.875rem; }
    .offer-tags { display:flex; flex-wrap:wrap; gap:0.5rem; }
    .info-chip { display:inline-flex; align-items:center; gap:0.375rem; padding:0.3rem 0.75rem; background:#f3f4f6; border-radius:9999px; font-size:0.8rem; color:#374151; }
    .desc-text { color:#374151; line-height:1.8; white-space:pre-wrap; }
    .skills-wrap { display:flex; flex-wrap:wrap; gap:0.5rem; }
    .skill-tag { padding:0.3rem 0.75rem; background:#eef2ff; color:#4f46e5; border-radius:8px; font-size:0.8rem; font-weight:600; }
    .apply-card { padding:1.25rem; }
    .apply-card h3 { font-size:1rem; font-weight:700; color:#111827; margin-bottom:1rem; }
    .closed-notice { color:#ef4444; font-size:0.875rem; }
    .info-list { display:grid; grid-template-columns:auto 1fr; gap:0.5rem 1rem;
      dt { font-size:0.78rem; color:#9ca3af; font-weight:600; text-transform:uppercase; }
      dd { font-size:0.875rem; color:#374151; font-weight:500; }
    }
    .back-row { margin-bottom: 0; }
  `]
})
export class OffreDetailComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private svc     = inject(OffreStageService);
  private candSvc = inject(CandidatureService);
  protected auth  = inject(AuthService);

  offre          = signal<OffreStage | null>(null);
  loading        = signal(true);
  lettreMotivation = '';
  postuleLoading = signal(false);
  postuleError   = signal<string | null>(null);
  postuleSuccess = signal<string | null>(null);

  skills() { return this.offre()?.competencesRequises.split(',').map(s => s.trim()) ?? []; }
  companyInitial() { return (this.offre()?.entreprise?.raisonSociale ?? this.offre()?.titre ?? '?')[0].toUpperCase(); }

  backRoute() {
    const role = this.auth.role();
    if (role === 'ADMIN') return '/admin/offres';
    if (role === 'ENTREPRISE') return '/entreprise/offres';
    if (role === 'ETUDIANT') return '/etudiant/offres';
    return '/';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.svc.getById(+id).subscribe({
        next: o => { this.offre.set(o); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else { this.loading.set(false); }
  }

  postuler() {
    if (!this.lettreMotivation.trim()) {
      this.postuleError.set('La lettre de motivation est requise.');
      return;
    }
    this.postuleLoading.set(true);
    this.postuleError.set(null);
    this.candSvc.postuler({ offreStageId: this.offre()!.id!, lettreMotivation: this.lettreMotivation }).subscribe({
      next: () => { this.postuleLoading.set(false); this.postuleSuccess.set('Candidature envoyée avec succès ! 🎉'); },
      error: err => { this.postuleLoading.set(false); this.postuleError.set(err.error?.message ?? 'Erreur lors de l\'envoi.'); }
    });
  }
}
