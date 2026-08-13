import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { OffreStageService } from '../../../services/offre-stage.service';
import { CandidatureService } from '../../../services/candidature.service';
import { AuthService } from '../../../services/auth.service';
import { OffreStage } from '../../../models/offre-stage';

@Component({
  selector: 'app-offres-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Offres de stage</h1>
        <p class="page-subtitle">{{ filtered().length }} offre(s) trouvée(s)</p>
      </div>
      @if (auth.isAdmin() || auth.isEntreprise()) {
        <a [routerLink]="newOffreRoute()" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nouvelle offre
        </a>
      }
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <div class="search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" class="form-control search-input" [(ngModel)]="searchTerm"
               placeholder="Rechercher par titre, lieu..." aria-label="Rechercher une offre"/>
      </div>
      <select class="form-control filter-select" [(ngModel)]="statutFilter" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option value="OUVERTE">Ouvertes</option>
        <option value="FERMEE">Fermées</option>
      </select>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <div class="spinner" style="width:32px;height:32px"></div>
        <p>Chargement des offres...</p>
      </div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
        <h3>Aucune offre trouvée</h3>
        <p>Essayez de modifier vos critères de recherche.</p>
      </div>
    } @else {
      <div class="card" style="overflow:hidden">
        <table class="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Entreprise</th>
              <th>Lieu</th>
              <th>Compétence</th>
              <th>Période</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (offre of filtered(); track offre.id) {
              <tr>
                <td><strong>{{ offre.titre }}</strong></td>
                <td>{{ offre.entreprise?.raisonSociale ?? '—' }}</td>
                <td>{{ offre.lieu }}</td>
                <td><span class="tag">{{ offre.competencesRequises ? offre.competencesRequises.split(',')[0] : '—' }}</span></td>
                <td style="font-size:0.8rem">
                  {{ offre.dateDebut | date:'dd/MM/yy' }} → {{ offre.dateFin | date:'dd/MM/yy' }}
                </td>
                <td>
                  <span class="badge" [class]="badgeClass(offre.statut)">{{ label(offre.statut) }}</span>
                </td>
                <td>
                  <div class="action-btns">
                    @if (auth.isEtudiant()) {
                      <button class="btn btn-sm btn-primary" (click)="ouvrirPostuler(offre)">
                        Postuler
                      </button>
                    }
                    @if (auth.isAdmin() || auth.isEntreprise()) {
                      <a [routerLink]="editRoute(offre.id!)" class="btn btn-sm btn-outline" title="Modifier">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      </a>
                    }
                    @if (auth.isAdmin()) {
                      <button class="btn btn-sm"
                              [class]="offre.statut === 'OUVERTE' ? 'btn-warning' : 'btn-success'"
                              (click)="toggleStatut(offre)">
                        {{ offre.statut === 'OUVERTE' ? 'Fermer' : 'Ouvrir' }}
                      </button>
                      <button class="btn btn-sm btn-danger" (click)="supprimer(offre)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Modal postuler -->
    @if (postuleOffre()) {
      <div class="modal-overlay" (click)="annulerPostuler()">
        <div class="modal-box" (click)="$event.stopPropagation()" role="dialog" aria-modal="true"
             aria-labelledby="modal-title">
          <div class="modal-header">
            <h3 id="modal-title">Postuler : {{ postuleOffre()!.titre }}</h3>
            <button (click)="annulerPostuler()" aria-label="Fermer">&times;</button>
          </div>
          <div class="modal-body">
            <p style="color:#6b7280;font-size:0.875rem;margin-bottom:1rem">
              Rédigez votre lettre de motivation pour
              <strong>{{ postuleOffre()!.entreprise?.raisonSociale }}</strong>.
            </p>
            <textarea class="form-control" rows="6" [(ngModel)]="lettreMotivation"
                      placeholder="Bonjour, je souhaite postuler à ce stage car..."
                      aria-label="Lettre de motivation"></textarea>
            @if (postuleError()) {
              <p class="form-error" style="margin-top:0.5rem">{{ postuleError() }}</p>
            }
            @if (postuleSuccess()) {
              <div class="alert alert-success" style="margin-top:0.75rem">{{ postuleSuccess() }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="annulerPostuler()">Annuler</button>
            <button class="btn btn-primary" (click)="submitPostuler()" [disabled]="postuleLoading()">
              @if (postuleLoading()) { <span class="spinner"></span> }
              Envoyer ma candidature
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .filters-bar { display:flex; gap:0.75rem; margin-bottom:1.25rem; flex-wrap:wrap; }
    .search-wrap { position:relative; flex:1; min-width:220px;
      svg { position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); pointer-events:none; }
    }
    .search-input { padding-left:2.25rem; }
    .filter-select { width:160px; }
    .action-btns { display:flex; gap:0.375rem; align-items:center; flex-wrap:wrap; }
    .loading-state { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:4rem; color:#6b7280; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; }
    .modal-box { background:white; border-radius:16px; width:100%; max-width:520px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid #e5e7eb;
      h3 { font-size:1rem; font-weight:700; color:#111827; margin:0; }
      button { font-size:1.5rem; color:#9ca3af; line-height:1; &:hover { color:#374151; } }
    }
    .modal-body { padding:1.5rem; }
    .modal-footer { display:flex; gap:0.75rem; justify-content:flex-end; padding:1.25rem 1.5rem; border-top:1px solid #e5e7eb; }
    .btn-warning { background:#f59e0b; color:white; &:hover { background:#d97706; } }
  `]
})
export class OffresListComponent implements OnInit {
  private svc          = inject(OffreStageService);
  private candSvc      = inject(CandidatureService);
  protected auth       = inject(AuthService);

  offres     = signal<OffreStage[]>([]);
  loading    = signal(true);
  searchTerm    = '';
  statutFilter  = '';

  // Postuler modal
  postuleOffre    = signal<OffreStage | null>(null);
  lettreMotivation = '';
  postuleLoading  = signal(false);
  postuleError    = signal<string | null>(null);
  postuleSuccess  = signal<string | null>(null);

  filtered = computed(() => {
    const term = this.searchTerm.toLowerCase();
    const stat = this.statutFilter;
    return this.offres().filter(o => {
      const matchTerm = !term ||
        o.titre.toLowerCase().includes(term) ||
        (o.lieu?.toLowerCase().includes(term) ?? false);
      const matchStat = !stat || o.statut === stat;
      return matchTerm && matchStat;
    });
  });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => { this.offres.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  newOffreRoute() {
    return this.auth.role() === 'ADMIN' ? '/admin/offres/nouvelle' : '/entreprise/offres/nouvelle';
  }

  editRoute(id: number) {
    return this.auth.role() === 'ADMIN' ? `/admin/offres/${id}/modifier` : `/entreprise/offres/${id}/modifier`;
  }

  badgeClass(s: string) { return s === 'OUVERTE' ? 'badge-success' : 'badge-gray'; }
  label(s: string)      { return s === 'OUVERTE' ? 'Ouverte' : 'Fermée'; }

  toggleStatut(offre: OffreStage) {
    const next = offre.statut === 'OUVERTE' ? 'FERMEE' : 'OUVERTE';
    this.svc.changerStatut(offre.id!, next).subscribe({
      next: u => this.offres.update(l => l.map(o => o.id === u.id ? u : o))
    });
  }

  supprimer(offre: OffreStage) {
    if (!confirm(`Supprimer l'offre "${offre.titre}" ?`)) return;
    this.svc.delete(offre.id!).subscribe({
      next: () => this.offres.update(l => l.filter(o => o.id !== offre.id))
    });
  }

  ouvrirPostuler(offre: OffreStage) {
    this.postuleOffre.set(offre);
    this.lettreMotivation = '';
    this.postuleError.set(null);
    this.postuleSuccess.set(null);
  }

  annulerPostuler() { this.postuleOffre.set(null); }

  submitPostuler() {
    if (!this.lettreMotivation.trim()) {
      this.postuleError.set('La lettre de motivation est requise.');
      return;
    }
    const offre = this.postuleOffre();
    if (!offre) return;

    this.postuleLoading.set(true);
    this.postuleError.set(null);

    this.candSvc.postuler({
      offreStageId: offre.id!,
      lettreMotivation: this.lettreMotivation
    }).subscribe({
      next: () => {
        this.postuleLoading.set(false);
        this.postuleSuccess.set('Candidature envoyée avec succès !');
        setTimeout(() => this.postuleOffre.set(null), 1500);
      },
      error: err => {
        this.postuleLoading.set(false);
        this.postuleError.set(err.error?.message ?? 'Erreur lors de la soumission.');
      }
    });
  }
}
