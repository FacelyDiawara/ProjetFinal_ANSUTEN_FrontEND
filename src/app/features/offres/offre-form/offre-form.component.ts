import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { OffreStageService } from '../../../services/offre-stage.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-offre-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container">
      <div class="page-header" style="margin-bottom: 1.5rem;">
        <div>
          <h1 class="page-title">{{ isEdit() ? "Modifier l'offre" : 'Nouvelle offre de stage' }}</h1>
          <p class="page-subtitle">{{ isEdit() ? 'Mettez à jour les informations relatives à cette offre' : 'Remplissez le formulaire ci-dessous pour publier votre offre' }}</p>
        </div>
        <a routerLink=".." class="btn btn-outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour
        </a>
      </div>

      @if (errorMsg()) {
        <div class="alert alert-danger" style="margin-bottom: 1.5rem;" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          {{ errorMsg() }}
        </div>
      }

      <div class="form-card">
        <div class="form-card-header">
          <div>
            <h2>{{ isEdit() ? "Édition de l'offre" : "Formulaire d'offre" }}</h2>
            <p>Veuillez renseigner des informations précises pour maximiser l'intérêt des candidats.</p>
          </div>
          <div class="form-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-card-body">
            
            <!-- Section 1: Postion info -->
            <div class="form-section">
              <div class="form-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                1. Informations Générales
              </div>

              <div class="form-row" style="margin-bottom: 1.25rem;">
                <div class="form-group">
                  <label class="form-label" for="titre">Titre du poste *</label>
                  <input id="titre" type="text" class="form-control" formControlName="titre" placeholder="Ex: Développeur Web Fullstack"/>
                  @if (f['titre'].invalid && f['titre'].touched) {
                    <span class="form-error">Le titre du poste est requis</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label" for="lieu">Lieu du stage *</label>
                  <input id="lieu" type="text" class="form-control" formControlName="lieu" placeholder="Ex: Labé / Télétravail"/>
                  @if (f['lieu'].invalid && f['lieu'].touched) {
                    <span class="form-error">Le lieu est requis</span>
                  }
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label" for="comp">Compétences requises *</label>
                <input id="comp" type="text" class="form-control" formControlName="competencesRequises" placeholder="Ex: Angular,reactjs, Spring Boot, MySQL, Git"/>
                @if (f['competencesRequises'].invalid && f['competencesRequises'].touched) {
                  <span class="form-error">Précisez au moins une compétence</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="desc">Description détaillée *</label>
                <textarea id="desc" class="form-control" formControlName="description" rows="4" placeholder="Décrivez les objectifs du stage, les missions principales et les exigences..."></textarea>
                @if (f['description'].invalid && f['description'].touched) {
                  <span class="form-error">La description est requise</span>
                }
              </div>
            </div>

            <!-- Section 2: Dates & Status -->
            <div class="form-section">
              <div class="form-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                2. Durée & Statut
              </div>

              <div class="form-row" style="margin-bottom: 1.25rem;">
                <div class="form-group">
                  <label class="form-label" for="debut">Date de début *</label>
                  <input id="debut" type="date" class="form-control" formControlName="dateDebut"/>
                  @if (f['dateDebut'].invalid && f['dateDebut'].touched) {
                    <span class="form-error">Date de début requise</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label" for="fin">Date de fin *</label>
                  <input id="fin" type="date" class="form-control" formControlName="dateFin"/>
                  @if (f['dateFin'].invalid && f['dateFin'].touched) {
                    <span class="form-error">Date de fin requise</span>
                  }
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="statut">Statut de publication</label>
                <select id="statut" class="form-select" formControlName="statut">
                  <option value="OUVERTE">Ouverte </option>
                  <option value="FERMEE">Fermée </option>
                </select>
              </div>
            </div>

          </div>

          <div class="form-card-footer" style="display: flex; justify-content: center; gap: 1rem;">
            <a routerLink=".." class="btn btn-outline">Annuler</a>
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span>
              }
              {{ isEdit() ? 'Enregistrer les modifications' : "Créer l'offre de stage" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OffreFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private svc     = inject(OffreStageService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  protected auth  = inject(AuthService);

  isEdit   = signal(false);
  loading  = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.group({
    titre:               ['', Validators.required],
    lieu:                ['', Validators.required],
    description:         ['', Validators.required],
    competencesRequises: ['', Validators.required],
    dateDebut:           ['', Validators.required],
    dateFin:             ['', Validators.required],
    statut:              ['OUVERTE']
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.svc.getById(+id).subscribe({ next: o => this.form.patchValue(o as never), error: () => {} });
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);

    const id  = this.route.snapshot.paramMap.get('id');
    const req = this.isEdit()
      ? this.svc.update(+id!, this.form.getRawValue() as never)
      : this.svc.create(this.form.getRawValue() as never);

    req.subscribe({
      next: () => this.router.navigate(['..'], { relativeTo: this.route }),
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? "Erreur lors de l'enregistrement.");
      }
    });
  }
}
