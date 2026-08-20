import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntrepriseService } from '../../../services/entreprise.service';
import { AuthService } from '../../../services/auth.service';
import { Entreprise } from '../../../models/entreprise';

@Component({
  selector: 'app-entreprises-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Entreprises</h1>
        <p class="page-subtitle">{{ filtered().length }} entreprise(s) partenaire(s)</p>
      </div>
      @if (auth.isAdmin()) {
        <button class="btn btn-primary" (click)="openAddModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nouvelle Entreprise
        </button>
      }
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
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>
          </svg>
        </div>
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

    <!-- Modal Ajouter Entreprise -->
    @if (showAddModal()) {
      <div class="modal-backdrop" (click)="closeAddModal()" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
        <div class="modal add-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
              <div>
                <h2 id="add-modal-title" style="margin:0;font-size:1.1rem;font-weight:700;color:#0f172a">Nouvelle Entreprise</h2>
                <p style="margin:0.15rem 0 0;font-size:0.78rem;color:#94a3b8">Ajouter une entreprise au système</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm btn-icon" (click)="closeAddModal()" aria-label="Fermer la modale">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <form [formGroup]="addForm" (ngSubmit)="submitAdd()" novalidate>
              <div class="field-group centered-field">
                <label class="field-label" for="raisonSociale">Raison Sociale</label>
                <input id="raisonSociale" type="text" class="field-input" formControlName="raisonSociale"/>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="secteurActivite">Secteur d'Activité</label>
                <input id="secteurActivite" type="text" class="field-input" formControlName="secteurActivite"/>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="adresse">Adresse</label>
                <input id="adresse" type="text" class="field-input" formControlName="adresse"/>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="siteWeb">Site Web</label>
                <input id="siteWeb" type="text" class="field-input" formControlName="siteWeb"/>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="statut">Statut (Validation)</label>
                <div class="select-wrap">
                  <select id="statut" class="field-input" formControlName="statut">
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="VALIDEE">Validée</option>
                    <option value="REJETEE">Rejetée</option>
                  </select>
                  <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              @if (addError()) {
                <div class="alert-error" role="alert">{{ addError() }}</div>
              }

              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" (click)="closeAddModal()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="addForm.invalid || addLoading()">
                  @if (addLoading()) {
                    <span class="spinner" style="width:14px;height:14px;border-width:2px"></span>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  }
                  Enregistrer
                </button>
              </div>
            </form>
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
    .loading-state { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:4rem; color:#6b7280; }
    .cell-company { display:flex; align-items:center; gap:0.625rem; }
    .company-icon { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,#0ea5e9,#6366f1); display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0; }
    .fw-semibold { font-weight:600; }
    .text-muted { color:#6b7280; }
    .action-btns { display:flex; gap:0.375rem; align-items:center; }
    .btn-success { background:#10b981; color:white; &:hover { background:#059669; } }
    .btn-warning { background:#f59e0b; color:white; &:hover { background:#d97706; } }

    /* ── Modal Styles ── */
    .add-modal { max-width:520px; width:95%; }
    .modal-title-wrap { display:flex; align-items:center; gap:0.875rem; }
    .modal-icon-badge { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,#6366f1,#818cf8); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
    .field-group { display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1.1rem; }
    .centered-field { max-width:400px; margin-left:auto; margin-right:auto; }
    .field-label { font-size:0.82rem; font-weight:600; color:#374151; }
    .field-input { padding:0.6rem 0.875rem; border:1.5px solid #e5e7eb; border-radius:10px; font-size:0.875rem; font-family:inherit; color:#0f172a; outline:none; transition:border-color 0.15s; width:100%; box-sizing:border-box; background:#fff; &:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); } }
    .select-wrap { position:relative; }
    .select-wrap select { appearance:none; padding-right:2.2rem; cursor:pointer; }
    .select-arrow { position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); pointer-events:none; color:#94a3b8; }
    .alert-error { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:0.75rem 1rem; font-size:0.82rem; color:#dc2626; margin-bottom:1rem; }
    .modal-actions { display:flex; justify-content:center; gap:0.75rem; padding-top:0.5rem; border-top:1px solid #f1f5f9; margin-top:0.5rem; }
  `]
})
export class EntreprisesListComponent implements OnInit {
  private svc    = inject(EntrepriseService);
  private fb     = inject(FormBuilder);
  protected auth = inject(AuthService);

  all          = signal<Entreprise[]>([]);
  loading      = signal(true);
  searchTerm   = '';
  filterStatut = '';

  /* ── Add modal state ── */
  showAddModal = signal(false);
  addLoading   = signal(false);
  addError     = signal<string | null>(null);

  addForm: FormGroup = this.fb.group({
    raisonSociale:   ['', Validators.required],
    secteurActivite: ['', Validators.required],
    adresse:         ['', Validators.required],
    siteWeb:         [''],
    statut:          ['EN_ATTENTE', Validators.required]
  });

  openAddModal() {
    this.addForm.reset({ statut: 'EN_ATTENTE' });
    this.addError.set(null);
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  submitAdd() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.addLoading.set(true);
    this.addError.set(null);
    const payload = this.addForm.value;
    // Ajout de champs factices pour le test si non fournis, le backend peut s'attendre à certaines valeurs
    if (!payload.email) payload.email = `contact@${payload.raisonSociale.toLowerCase().replace(/\\s/g,'')}.com`;
    if (!payload.telephone) payload.telephone = '—';

    this.svc.create(payload as Entreprise).subscribe({
      next: (newEntreprise) => {
        this.all.update(list => [newEntreprise, ...list]);
        this.addLoading.set(false);
        this.closeAddModal();
      },
      error: (err) => {
        this.addLoading.set(false);
        this.addError.set(err.error?.message ?? err.message ?? "Erreur lors de la création de l'entreprise");
      }
    });
  }

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
