import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import { OffreStageService } from '../../services/offre-stage.service';
import { OffreStage } from '../../models/offre-stage';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, DatePipe, SlicePipe],
  template: `
    <!-- Hero -->
    <header class="hero">
      <div class="hero-inner">
        <div class="brand">
          <div class="brand-logo">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#hg)"/>
              <path d="M8 26L18 10L28 26H8Z" fill="white" opacity="0.9"/>
              <circle cx="18" cy="18" r="4" fill="white"/>
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#4f46e5"/><stop offset="1" stop-color="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="brand-name">UniStage</span>
        </div>
        <nav class="hero-nav">
          @if (isLoggedIn()) {
            <a [routerLink]="dashboardLink()" class="btn btn-white">Mon espace</a>
            <button class="btn btn-ghost-white" (click)="onLogout()">Déconnexion</button>
          } @else {
            <a routerLink="/auth/login" class="btn btn-ghost-white">Connexion</a>
            <a routerLink="/auth/register" class="btn btn-white">S'inscrire</a>
          }
        </nav>
      </div>
      <div class="hero-content">
        <div class="hero-badge">🎓 Université de Labé</div>
        <h1>Trouvez votre stage idéal</h1>
        <p>Des centaines d'offres de stage vous attendent. Rejoignez UniStage et lancez votre carrière.</p>
        <div class="hero-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Rechercher par titre, lieu, compétence..." [(ngModel)]="searchTerm" aria-label="Rechercher une offre"/>
          <button class="btn btn-primary" type="button">Rechercher</button>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>{{ offres().length }}</strong><span>Offres actives</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><strong>100%</strong><span>Gratuit</span></div>
          <div class="stat-sep"></div>
          <div class="stat"><strong>3 rôles</strong><span>Étudiant · Entreprise · Admin</span></div>
        </div>
      </div>
    </header>

    <!-- Offers section -->
    <main class="offers-section">
      <div class="section-header">
        <div>
          <h2>Offres de stage ouvertes</h2>
          <p>{{ filtered().length }} offre(s) disponible(s)</p>
        </div>
        <div class="filter-chips">
          <button class="chip" [class.active]="!filterLieu" (click)="filterLieu=''">Tous les lieux</button>
          @for (lieu of lieux(); track lieu) {
            <button class="chip" [class.active]="filterLieu===lieu" (click)="filterLieu=lieu">{{ lieu }}</button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="loading-grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="offer-card skeleton"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          <h3>Aucune offre trouvée</h3>
          <p>Modifiez vos critères ou revenez plus tard.</p>
        </div>
      } @else {
        <div class="offers-grid">
          @for (o of filtered(); track o.id) {
            <article class="offer-card">
              <div class="offer-card-top">
                <div class="company-avatar">{{ companyInitial(o) }}</div>
                <div class="offer-meta">
                  <span class="badge badge-success">Ouverte</span>
                  @if (o.lieu) { <span class="location">📍 {{ o.lieu }}</span> }
                </div>
              </div>
              <h3 class="offer-title">{{ o.titre }}</h3>
              <p class="offer-company">{{ o.entreprise?.raisonSociale ?? 'Entreprise partenaire' }}</p>
              <p class="offer-desc">{{ o.description | slice:0:120 }}{{ o.description.length > 120 ? '...' : '' }}</p>
              <div class="offer-skills">
                @for (skill of skills(o); track skill) {
                  <span class="skill-tag">{{ skill }}</span>
                }
              </div>
              <div class="offer-footer">
                <span class="offer-date">Du {{ o.dateDebut | date:'dd/MM/yyyy' }}</span>
                <a routerLink="/auth/login" class="btn btn-sm btn-primary">Postuler →</a>
              </div>
            </article>
          }
        </div>
      }
    </main>

    <!-- CTA Footer -->
    <section class="cta-section">
      <h2>Prêt à démarrer ?</h2>
      <p>Créez votre compte en quelques secondes et accédez à toutes les offres.</p>
      <div class="cta-btns">
        <a routerLink="/auth/register" class="btn btn-white">Je suis étudiant</a>
        <a routerLink="/auth/register" class="btn btn-outline-white">Je suis une entreprise</a>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100dvh; background: #f9fafb; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      color: white; padding-bottom: 3.5rem;
    }
    .hero-inner {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 2rem; max-width: 1200px; margin: 0 auto;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-logo { width: 40px; height: 40px; border-radius: 10px; overflow: hidden; }
    .brand-name { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
    .hero-nav { display: flex; gap: 0.75rem; }
    .btn-ghost-white { color: rgba(255,255,255,0.8); &:hover { color: white; background: rgba(255,255,255,0.08); } }
    .btn-white { background: white; color: #4f46e5; font-weight: 700; &:hover { background: #f0f0ff; } }
    .hero-content {
      text-align: center; padding: 3.5rem 1.5rem 0; max-width: 760px; margin: 0 auto;
    }
    .hero-badge {
      display: inline-block; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
      border-radius: 9999px; padding: 0.3rem 1rem; font-size: 0.8rem; font-weight: 600; margin-bottom: 1.25rem;
    }
    .hero-content h1 {
      font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; letter-spacing: -0.04em;
      margin-bottom: 1rem; line-height: 1.1;
    }
    .hero-content > p { color: rgba(255,255,255,0.72); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; }
    .hero-search {
      display: flex; align-items: center; background: white; border-radius: 14px;
      padding: 0.5rem 0.5rem 0.5rem 1rem; gap: 0.75rem; max-width: 600px; margin: 0 auto 2rem;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
      input { flex: 1; font-size: 0.9rem; color: #111827; outline: none; background: transparent; border: none; }
    }
    .hero-stats {
      display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap;
      .stat { display: flex; flex-direction: column; gap: 0.2rem;
        strong { font-size: 1.4rem; font-weight: 800; }
        span { font-size: 0.75rem; color: rgba(255,255,255,0.6); }
      }
      .stat-sep { width: 1px; height: 32px; background: rgba(255,255,255,0.2); }
    }

    /* Offers */
    .offers-section { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
      h2 { font-size: 1.5rem; font-weight: 800; color: #111827; margin-bottom: 0.25rem; }
      p { color: #6b7280; font-size: 0.875rem; }
    }
    .filter-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .chip {
      padding: 0.375rem 0.875rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600;
      border: 1.5px solid #e5e7eb; color: #6b7280; cursor: pointer; transition: all 0.18s;
      &:hover { border-color: #818cf8; color: #4f46e5; }
      &.active { background: #4f46e5; border-color: #4f46e5; color: white; }
    }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
    .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }

    .offer-card {
      background: white; border-radius: 16px; padding: 1.5rem;
      border: 1.5px solid #f0f0f0; transition: all 0.2s;
      &:hover { border-color: #c7d2fe; box-shadow: 0 8px 24px rgba(79,70,229,0.1); transform: translateY(-2px); }
      &.skeleton { min-height: 240px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
    }
    @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
    .offer-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .company-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center;
      justify-content: center; color: white; font-weight: 800; font-size: 1.1rem;
    }
    .offer-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .location { font-size: 0.75rem; color: #6b7280; }
    .offer-title { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: 0.25rem; }
    .offer-company { font-size: 0.8rem; color: #6b7280; font-weight: 500; margin-bottom: 0.75rem; }
    .offer-desc { font-size: 0.82rem; color: #6b7280; line-height: 1.6; margin-bottom: 0.875rem; }
    .offer-skills { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 1rem; }
    .skill-tag { padding: 0.2rem 0.6rem; background: #f0f0ff; color: #4f46e5; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
    .offer-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f3f4f6; padding-top: 0.875rem; }
    .offer-date { font-size: 0.75rem; color: #9ca3af; }
    .empty-state { text-align: center; padding: 4rem 1.5rem; color: #9ca3af;
      h3 { font-size: 1.1rem; font-weight: 700; color: #6b7280; margin: 1rem 0 0.5rem; }
      p { font-size: 0.875rem; }
    }

    /* CTA */
    .cta-section {
      background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white;
      text-align: center; padding: 4rem 1.5rem;
      h2 { font-size: 2rem; font-weight: 900; margin-bottom: 0.75rem; }
      p { color: rgba(255,255,255,0.75); margin-bottom: 2rem; font-size: 1rem; }
    }
    .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn-outline-white { border: 2px solid rgba(255,255,255,0.5); color: white; font-weight: 700;
      &:hover { background: rgba(255,255,255,0.1); border-color: white; }
    }

    @media (max-width: 640px) {
      .hero-inner { flex-direction: column; gap: 1rem; }
      .hero-search { flex-direction: column; .btn { width: 100%; } }
      .section-header { flex-direction: column; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private svc    = inject(OffreStageService);
  private auth   = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.auth.isLoggedIn;

  dashboardLink = computed(() => {
    const role = this.auth.role();
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'ENTREPRISE') return '/entreprise/dashboard';
    return '/etudiant/dashboard';
  });

  offres     = signal<OffreStage[]>([]);
  loading    = signal(true);
  searchTerm = '';
  filterLieu = '';

  lieux = computed(() => [...new Set(this.offres().map(o => o.lieu).filter(Boolean) as string[])]);

  filtered = computed(() => {
    const term = this.searchTerm.toLowerCase();
    return this.offres().filter(o =>
      o.statut === 'OUVERTE' &&
      (!this.filterLieu || o.lieu === this.filterLieu) &&
      (!term || o.titre.toLowerCase().includes(term) ||
       (o.lieu?.toLowerCase().includes(term) ?? false) ||
       o.competencesRequises.toLowerCase().includes(term))
    );
  });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => { this.offres.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  companyInitial(o: OffreStage) {
    return (o.entreprise?.raisonSociale ?? o.titre)[0].toUpperCase();
  }

  skills(o: OffreStage) {
    return o.competencesRequises.split(',').map(s => s.trim()).slice(0, 3);
  }

  onLogout(): void {
    this.auth.logout();
  }
}
