import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EtudiantService } from '../../../services/etudiant.service';
import { AuthService } from '../../../services/auth.service';
import { Etudiant } from '../../../models/etudiant';

@Component({
  selector: 'app-etudiants-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Étudiants</h1>
        <p class="page-subtitle">{{ filtered().length }} étudiant(s) inscrit(s)</p>
      </div>
      @if (auth.isAdmin()) {
        <button class="btn btn-primary" (click)="openAddModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nouveau Étudiant
        </button>
      }
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
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
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
                    <div class="action-btns">
                      <button class="btn-action btn-action-danger" (click)="supprimer(e)"
                              title="Supprimer cet étudiant" aria-label="Supprimer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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

    <!-- Modal Ajouter Etudiant -->
    @if (showAddModal()) {
      <div class="modal-backdrop" (click)="closeAddModal()" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">
        <div class="modal add-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </div>
              <div>
                <h2 id="add-modal-title" style="margin:0;font-size:1.1rem;font-weight:700;color:#0f172a">Nouvel Étudiant</h2>
                <p style="margin:0.15rem 0 0;font-size:0.78rem;color:#94a3b8">Ajouter un étudiant au système</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm btn-icon" (click)="closeAddModal()" aria-label="Fermer la modale">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <form [formGroup]="addForm" (ngSubmit)="submitAdd()" novalidate>
              <div class="field-group centered-field">
                <label class="field-label" for="matricule">Matricule</label>
                <input id="matricule" type="text" class="field-input" formControlName="matricule"/>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="filiere">Filière</label>
                <input id="filiere" type="text" class="field-input" formControlName="filiere"/>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="niveau">Niveau</label>
                <div class="select-wrap">
                  <select id="niveau" class="field-input" formControlName="niveau">
                    <option value="L1">Licence 1</option>
                    <option value="L2">Licence 2</option>
                    <option value="L3">Licence 3</option>
                    <option value="M1">Master 1</option>
                    <option value="M2">Master 2</option>
                  </select>
                  <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="telephone">Téléphone</label>
                <input id="telephone" type="text" class="field-input" formControlName="telephone"/>
              </div>
              <div class="field-group centered-field">
                <label class="field-label" for="cv">CV (Sélectionner un fichier)</label>
                <input id="cv" type="file" class="field-input" formControlName="cv"/>
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
    .cell-user { display:flex; align-items:center; gap:0.625rem; }
    .avatar-sm { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:0.72rem; flex-shrink:0; }
    .fw-semibold { font-weight:600; }
    .text-muted { color:#6b7280; }
    .action-btns { display:flex; gap:0.5rem; align-items:center; }

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
export class EtudiantsListComponent implements OnInit {
  private svc   = inject(EtudiantService);
  private fb    = inject(FormBuilder);
  protected auth = inject(AuthService);

  all         = signal<Etudiant[]>([]);
  loading     = signal(true);
  searchTerm  = '';
  filterNiveau = '';

  /* ── Add modal state ── */
  showAddModal = signal(false);
  addLoading   = signal(false);
  addError     = signal<string | null>(null);

  addForm: FormGroup = this.fb.group({
    matricule: ['', Validators.required],
    filiere:   ['', Validators.required],
    niveau:    ['L1', Validators.required],
    telephone: [''],
    cv:        ['']
  });

  openAddModal() {
    this.addForm.reset({ niveau: 'L1' });
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
    
    this.svc.create(payload as Etudiant).subscribe({
      next: (newEtudiant) => {
        this.all.update(list => [newEtudiant, ...list]);
        this.addLoading.set(false);
        this.closeAddModal();
      },
      error: (err) => {
        this.addLoading.set(false);
        this.addError.set(err.error?.message ?? err.message ?? "Erreur lors de la création de l'étudiant");
      }
    });
  }

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
