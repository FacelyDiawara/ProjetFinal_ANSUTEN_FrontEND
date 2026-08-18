import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CandidatureService } from '../../../services/candidature.service';
import { AuthService } from '../../../services/auth.service';
import { Candidature } from '../../../models/candidature';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-candidatures-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Candidatures</h1>
        <p class="page-subtitle">{{ filtered().length }} candidature(s)</p>
      </div>
      @if (auth.isAdmin()) {
        <a routerLink="/admin/candidatures/nouvelle" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nouvelle candidature
        </a>
      }
    </div>

    <div class="filters-bar">
      <div class="search-input">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input type="search" placeholder="Rechercher..." [(ngModel)]="searchTerm" aria-label="Rechercher"/>
      </div>
      <select class="form-ctrl" [(ngModel)]="filterStatut" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option value="EN_ATTENTE">En attente</option>
        <option value="ACCEPTEE">Acceptées</option>
        <option value="REJETEE">Rejetées</option>
      </select>
    </div>

    @if (loading()) {
      <div class="empty-state"><div class="spinner spinner-dark"></div></div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>
        <h3>Aucune candidature</h3>
        <p>Il n'y a aucune candidature pour le moment.</p>
      </div>
    } @else {
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Offre</th>
              <th>Entreprise</th>
              <th>Date soumission</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr>
                <td>
                  <div class="cell-user">
                    <div class="avatar-sm">{{ initials(c) }}</div>
                    <div>
                      <div class="fw-semibold">{{ c.etudiant?.utilisateur?.prenom }} {{ c.etudiant?.utilisateur?.nom }}</div>
                      <div class="text-muted" style="font-size:0.75rem">{{ c.etudiant?.utilisateur?.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ c.offreStage?.titre ?? '—' }}</td>
                <td>{{ c.offreStage?.entreprise?.raisonSociale ?? '—' }}</td>
                <td>{{ c.dateSoumission ? (c.dateSoumission | date:'dd/MM/yyyy') : '—' }}</td>
                <td>
                  @if (canManage()) {
                    <select class="statut-select" [value]="c.statut" (change)="changerStatut(c, $any($event.target).value)" [attr.aria-label]="'Statut de ' + c.etudiant?.utilisateur?.nom">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="ACCEPTEE">Acceptée</option>
                      <option value="REJETEE">Rejetée</option>
                    </select>
                  } @else {
                    <span class="badge" [class]="badgeClass(c.statut)">{{ label(c.statut) }}</span>
                  }
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm btn-icon" (click)="viewLetter(c)" title="Voir la lettre de motivation" aria-label="Voir lettre">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  </button>
                  @if (auth.isAdmin()) {
                    <a [routerLink]="['/admin/candidatures', c.id, 'modifier']" class="btn btn-ghost btn-sm btn-icon" title="Modifier">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </a>
                    <button class="btn btn-ghost btn-sm btn-icon" (click)="delete(c)" title="Supprimer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:#ef4444"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Modal lettre de motivation -->
    @if (selectedLetter()) {
      <div class="modal-backdrop" (click)="selectedLetter.set(null)" role="dialog" aria-modal="true" aria-label="Lettre de motivation">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Lettre de motivation</h2>
            <button class="btn btn-ghost btn-sm btn-icon" (click)="selectedLetter.set(null)" aria-label="Fermer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p style="line-height:1.7;color:#374151;white-space:pre-wrap">{{ selectedLetter() }}</p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .form-ctrl { padding:0.5rem 0.875rem; border:1.5px solid #e5e7eb; border-radius:10px; font-size:0.875rem; outline:none; width:160px; &:focus { border-color:#818cf8; } }
    .cell-user { display:flex; align-items:center; gap:0.625rem; }
    .avatar-sm { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:0.72rem; flex-shrink:0; }
    .action-btns { display:flex; gap:0.375rem; }
    .statut-select { appearance:none; background:transparent; border:1.5px solid #e5e7eb; border-radius:9999px; padding:0.2rem 1.5rem 0.2rem 0.625rem; font-size:0.75rem; font-weight:700; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 0.375rem center; background-size:0.875rem; text-transform:uppercase; letter-spacing:0.04em; }
  `]
})
export class CandidaturesListComponent implements OnInit {
  private svc  = inject(CandidatureService);
  protected auth = inject(AuthService);

  all          = signal<Candidature[]>([]);
  loading      = signal(true);
  searchTerm   = '';
  filterStatut = '';
  selectedLetter = signal<string | null>(null);

  filtered = computed(() => {
    const term = this.searchTerm.toLowerCase();
    return this.all().filter(c =>
      (!term || (c.etudiant?.utilisateur?.nom ?? '').toLowerCase().includes(term) ||
       (c.offreStage?.titre ?? '').toLowerCase().includes(term)) &&
      (!this.filterStatut || c.statut === this.filterStatut)
    );
  });

  canManage = computed(() => this.auth.isAdmin() || this.auth.isEntreprise());

  ngOnInit() {
    this.svc.getAll().subscribe({ next: d => { this.all.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  initials(c: Candidature) {
    const u = c.etudiant?.utilisateur;
    return `${u?.prenom?.[0] ?? ''}${u?.nom?.[0] ?? ''}`.toUpperCase();
  }

  badgeClass(s: string) { return { EN_ATTENTE:'badge-warning', ACCEPTEE:'badge-success', REJETEE:'badge-danger' }[s] ?? 'badge-gray'; }
  label(s: string)      { return { EN_ATTENTE:'En attente', ACCEPTEE:'Acceptée', REJETEE:'Rejetée' }[s] ?? s; }

  changerStatut(c: Candidature, statut: string) {
    this.svc.changerStatut(c.id!, statut).subscribe({ next: updated => this.all.update(list => list.map(x => x.id === updated.id ? updated : x)), error: () => {} });
  }

  viewLetter(c: Candidature) { this.selectedLetter.set(c.lettreMotivation); }

  delete(c: Candidature) {
    if (!confirm('Supprimer cette candidature ?')) return;
    this.svc.delete(c.id!).subscribe({ next: () => this.all.update(list => list.filter(x => x.id !== c.id)), error: () => {} });
  }
}
