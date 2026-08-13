import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EtudiantService } from '../../../services/etudiant.service';
import { AuthService } from '../../../services/auth.service';
import { Etudiant } from '../../../models/etudiant';

@Component({
  selector: 'app-etudiants-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Étudiants</h1>
        <p class="page-subtitle">{{ filtered().length }} étudiant(s) inscrit(s)</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" class="form-control search-input" [(ngModel)]="searchTerm"
               placeholder="Rechercher par nom, filière..." aria-label="Rechercher un étudiant"/>
      </div>
      <select class="form-control filter-select" [(ngModel)]="filterNiveau" aria-label="Filtrer par niveau">
        <option value="">Tous les niveaux</option>
        <option value="L1">Licence 1</option>
        <option value="L2">Licence 2</option>
        <option value="L3">Licence 3</option>
        <option value="M1">Master 1</option>
        <option value="M2">Master 2</option>
      </select>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <div class="spinner" style="width:32px;height:32px"></div>
        <p>Chargement des étudiants...</p>
      </div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
        </svg>
        <h3>Aucun étudiant trouvé</h3>
        <p>Essayez de modifier vos critères de recherche.</p>
      </div>
    } @else {
      <div class="card" style="overflow:hidden">
        <table class="table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Matricule</th>
              <th>Filière</th>
              <th>Niveau</th>
              <th>Téléphone</th>
              @if (auth.isAdmin()) { <th>Actions</th> }
            </tr>
          </thead>
          <tbody>
            @for (e of filtered(); track e.id) {
              <tr>
                <td>
                  <div class="cell-user">
                    <div class="avatar-sm">{{ initials(e) }}</div>
                    <div>
                      <div class="fw-semibold">{{ e.utilisateur?.prenom }} {{ e.utilisateur?.nom }}</div>
                      <div class="text-muted" style="font-size:0.75rem">{{ e.utilisateur?.email }}</div>
                    </div>
                  </div>
                </td>
                <td><code style="font-size:0.8rem;background:#f3f4f6;padding:0.15rem 0.4rem;border-radius:4px">{{ e.matricule }}</code></td>
                <td>{{ e.filiere }}</td>
                <td><span class="badge badge-info">{{ e.niveau }}</span></td>
                <td>{{ e.telephone ?? '—' }}</td>
                @if (auth.isAdmin()) {
                  <td>
                    <button class="btn btn-sm btn-danger" (click)="supprimer(e)"
                            title="Supprimer cet étudiant" aria-label="Supprimer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
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
    .cell-user { display:flex; align-items:center; gap:0.625rem; }
    .avatar-sm { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:0.72rem; flex-shrink:0; }
    .fw-semibold { font-weight:600; }
    .text-muted { color:#6b7280; }
  `]
})
export class EtudiantsListComponent implements OnInit {
  private svc   = inject(EtudiantService);
  protected auth = inject(AuthService);

  all         = signal<Etudiant[]>([]);
  loading     = signal(true);
  searchTerm  = '';
  filterNiveau = '';

  filtered = computed(() => {
    const term = this.searchTerm.toLowerCase();
    const niv  = this.filterNiveau;
    return this.all().filter(e => {
      const matchTerm = !term ||
        (e.utilisateur?.nom ?? '').toLowerCase().includes(term) ||
        (e.utilisateur?.prenom ?? '').toLowerCase().includes(term) ||
        (e.filiere ?? '').toLowerCase().includes(term) ||
        (e.matricule ?? '').toLowerCase().includes(term);
      const matchNiv = !niv || e.niveau === niv;
      return matchTerm && matchNiv;
    });
  });

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: d => { this.all.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  initials(e: Etudiant) {
    return `${e.utilisateur?.prenom?.[0] ?? ''}${e.utilisateur?.nom?.[0] ?? ''}`.toUpperCase();
  }

  supprimer(e: Etudiant) {
    if (!confirm(`Supprimer l'étudiant "${e.utilisateur?.prenom} ${e.utilisateur?.nom}" ?`)) return;
    this.svc.delete(e.id!).subscribe({
      next: () => this.all.update(list => list.filter(x => x.id !== e.id))
    });
  }
}
