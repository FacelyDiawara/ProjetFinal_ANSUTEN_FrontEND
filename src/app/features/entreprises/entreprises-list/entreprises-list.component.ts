import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntrepriseService } from '../../../services/entreprise.service';
import { AuthService } from '../../../services/auth.service';
import { Entreprise } from '../../../models/entreprise';

@Component({
  selector: 'app-entreprises-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Entreprises</h1>
        <p class="page-subtitle">{{ filtered().length }} entreprise(s) partenaire(s)</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" class="form-control search-input" [(ngModel)]="searchTerm"
               placeholder="Rechercher par nom, secteur..." aria-label="Rechercher une entreprise"/>
      </div>
      <select class="form-control filter-select" [(ngModel)]="filterStatut" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option value="EN_ATTENTE">En attente</option>
        <option value="VALIDEE">Validées</option>
        <option value="REJETEE">Rejetées</option>
      </select>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <div class="spinner" style="width:32px;height:32px"></div>
        <p>Chargement des entreprises...</p>
      </div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
          <path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm0-4H4V5h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z"/>
        </svg>
        <h3>Aucune entreprise trouvée</h3>
        <p>Essayez de modifier vos critères de recherche.</p>
      </div>
    } @else {
      <div class="card" style="overflow:hidden">
        <table class="table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Secteur</th>
              <th>Contact</th>
              <th>Téléphone</th>
              <th>Statut</th>
              @if (auth.isAdmin()) { <th>Actions</th> }
            </tr>
          </thead>
          <tbody>
            @for (e of filtered(); track e.id) {
              <tr>
                <td>
                  <div class="cell-company">
                    <div class="company-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm0-4H4V5h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z"/>
                      </svg>
                    </div>
                    <div>
                      <div class="fw-semibold">{{ e.raisonSociale }}</div>
                      <div class="text-muted" style="font-size:0.75rem">{{ e.adresse }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="tag">{{ e.secteurActivite }}</span></td>
                <td>{{ e.email }}</td>
                <td>{{ e.telephone }}</td>
                <td><span class="badge" [class]="badgeClass(e.statut)">{{ label(e.statut) }}</span></td>
                @if (auth.isAdmin()) {
                  <td>
                    <div class="action-btns">
                      @if (e.statut === 'EN_ATTENTE') {
                        <button class="btn btn-sm btn-success" (click)="valider(e)" title="Valider">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        </button>
                        <button class="btn btn-sm btn-warning" (click)="rejeter(e)" title="Rejeter">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                      }
                      <button class="btn btn-sm btn-danger" (click)="supprimer(e)" title="Supprimer" [attr.aria-label]="'Supprimer ' + e.raisonSociale">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
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
    .loading-state { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:4rem; color:#6b7280; }
    .cell-company { display:flex; align-items:center; gap:0.625rem; }
    .company-icon { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,#0ea5e9,#6366f1); display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0; }
    .fw-semibold { font-weight:600; }
    .text-muted { color:#6b7280; }
    .action-btns { display:flex; gap:0.375rem; align-items:center; }
    .btn-success { background:#10b981; color:white; &:hover { background:#059669; } }
    .btn-warning { background:#f59e0b; color:white; &:hover { background:#d97706; } }
  `]
})
export class EntreprisesListComponent implements OnInit {
  private svc    = inject(EntrepriseService);
  protected auth = inject(AuthService);

  all          = signal<Entreprise[]>([]);
  loading      = signal(true);
  searchTerm   = '';
  filterStatut = '';

  filtered = computed(() => {
    const term = this.searchTerm.toLowerCase();
    const stat = this.filterStatut;
    return this.all().filter(e => {
      const matchTerm = !term ||
        (e.raisonSociale ?? '').toLowerCase().includes(term) ||
        (e.secteurActivite ?? '').toLowerCase().includes(term) ||
        (e.email ?? '').toLowerCase().includes(term);
      const matchStat = !stat || e.statut === stat;
      return matchTerm && matchStat;
    });
  });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  badgeClass(s?: string) {
    return { EN_ATTENTE: 'badge-warning', VALIDEE: 'badge-success', REJETEE: 'badge-danger' }[s ?? ''] ?? 'badge-gray';
  }
  label(s?: string) {
    return { EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée' }[s ?? ''] ?? (s ?? '—');
  }

  valider(e: Entreprise) {
    this.svc.valider(e.id!).subscribe({
      next: updated => this.all.update(list => list.map(x => x.id === updated.id ? updated : x))
    });
  }

  rejeter(e: Entreprise) {
    this.svc.rejeter(e.id!).subscribe({
      next: updated => this.all.update(list => list.map(x => x.id === updated.id ? updated : x))
    });
  }

  supprimer(e: Entreprise) {
    if (!confirm(`Supprimer l'entreprise "${e.raisonSociale}" ?`)) return;
    this.svc.delete(e.id!).subscribe({
      next: () => this.all.update(list => list.filter(x => x.id !== e.id))
    });
  }
}
