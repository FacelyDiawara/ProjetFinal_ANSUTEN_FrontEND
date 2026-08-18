import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CandidatureService } from '../../../services/candidature.service';
import { OffreStageService } from '../../../services/offre-stage.service';
import { EtudiantService } from '../../../services/etudiant.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-candidature-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="form-container" style="max-width: 760px; margin: 0 auto; padding: 2rem 1rem;">
      <div class="page-header" style="margin-bottom: 1.5rem;">
        <div>
          <h1 class="page-title">{{ isEdit() ? 'Modifier la candidature' : 'Nouvelle candidature' }}</h1>
          <p class="page-subtitle">{{ isEdit() ? 'Mettre à jour les informations de la candidature' : 'Ajouter manuellement une candidature' }}</p>
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

      <div class="form-card card" style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div class="form-card-header" style="padding: 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0;">{{ isEdit() ? 'Édition' : 'Formulaire' }}</h2>
            <p style="font-size: 0.875rem; color: #64748b; margin: 0; margin-top: 0.25rem;">Veuillez remplir les informations requises</p>
          </div>
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-card-body" style="padding: 1.5rem;">
            
            <div class="form-row" style="display: flex; gap: 1.25rem; margin-bottom: 1.25rem;">
              <div class="form-group" style="flex: 1;">
                <label class="form-label" for="id">ID Candidature (Auto)</label>
                <input id="id" type="text" class="form-control" [value]="candidatureId() ?? 'Nouveau'" disabled style="background: #f1f5f9;"/>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label" for="dateSoumission">Date de soumission *</label>
                <input id="dateSoumission" type="date" class="form-control" formControlName="dateSoumission"/>
                @if (f['dateSoumission'].invalid && f['dateSoumission'].touched) {
                  <span class="form-error">Date requise</span>
                }
              </div>
            </div>

            @if (!isEdit()) {
              <div class="form-row" style="display: flex; gap: 1.25rem; margin-bottom: 1.25rem;">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" for="etudiantId">Étudiant *</label>
                  <select id="etudiantId" class="form-select" formControlName="etudiantId">
                    <option value="">-- Sélectionner un étudiant --</option>
                    @for (e of etudiants(); track e.id) {
                      <option [value]="e.id">{{ e.utilisateur?.prenom }} {{ e.utilisateur?.nom }} ({{ e.matricule }})</option>
                    }
                  </select>
                  @if (f['etudiantId'].invalid && f['etudiantId'].touched) {
                    <span class="form-error">Étudiant requis</span>
                  }
                </div>
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" for="offreStageId">Offre de stage *</label>
                  <select id="offreStageId" class="form-select" formControlName="offreStageId">
                    <option value="">-- Sélectionner une offre --</option>
                    @for (o of offres(); track o.id) {
                      <option [value]="o.id">{{ o.titre }} - {{ o.entreprise?.raisonSociale }}</option>
                    }
                  </select>
                  @if (f['offreStageId'].invalid && f['offreStageId'].touched) {
                    <span class="form-error">Offre requise</span>
                  }
                </div>
              </div>
            }

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" for="lettreMotivation">Lettre de motivation *</label>
              <textarea id="lettreMotivation" class="form-control" formControlName="lettreMotivation" rows="5" placeholder="Saisissez la lettre de motivation ici..."></textarea>
              @if (f['lettreMotivation'].invalid && f['lettreMotivation'].touched) {
                <span class="form-error">La lettre de motivation est requise</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="statut">Statut de la candidature *</label>
              <select id="statut" class="form-select" formControlName="statut">
                <option value="EN_ATTENTE">En attente</option>
                <option value="ACCEPTEE">Acceptée</option>
                <option value="REJETEE">Rejetée</option>
              </select>
              @if (f['statut'].invalid && f['statut'].touched) {
                <span class="form-error">Statut requis</span>
              }
            </div>

          </div>

          <div class="form-card-footer" style="padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem;">
            <a routerLink=".." class="btn btn-outline">Annuler</a>
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span>
              }
              {{ isEdit() ? 'Mettre à jour' : 'Ajouter la candidature' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-control, .form-select {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-control:focus, .form-select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .form-error {
      display: block;
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.25rem;
    }
  `]
})
export class CandidatureFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private svc     = inject(CandidatureService);
  private offreSvc = inject(OffreStageService);
  private etudiantSvc = inject(EtudiantService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  protected auth  = inject(AuthService);

  isEdit   = signal(false);
  loading  = signal(false);
  errorMsg = signal<string | null>(null);
  candidatureId = signal<number | null>(null);

  offres = signal<any[]>([]);
  etudiants = signal<any[]>([]);

  form = this.fb.group({
    dateSoumission:   [new Date().toISOString().substring(0, 10), Validators.required],
    lettreMotivation: ['', Validators.required],
    statut:           ['EN_ATTENTE', Validators.required],
    etudiantId:       [''],
    offreStageId:     ['']
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    // Only load offres and etudiants if we are creating a new candidature
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.candidatureId.set(+id);
      this.svc.getAll().subscribe({
        next: (cands) => {
          const c = cands.find(x => x.id === +id);
          if (c) {
            this.form.patchValue({
              dateSoumission: c.dateSoumission ? c.dateSoumission.substring(0, 10) : '',
              lettreMotivation: c.lettreMotivation,
              statut: c.statut
            });
            // Etudiant and offre fields are not usually editable after creation in this flow,
            // but we could set them if needed.
          }
        }
      });
    } else {
      this.form.controls['etudiantId'].setValidators([Validators.required]);
      this.form.controls['offreStageId'].setValidators([Validators.required]);
      
      this.offreSvc.getAll().subscribe(res => this.offres.set(res));
      this.etudiantSvc.getAll().subscribe(res => this.etudiants.set(res));
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);

    const val = this.form.getRawValue();
    
    if (this.isEdit()) {
      // Assuming changerStatut is the primary way to update a candidature,
      // but if we need a full update, we'd need an update method in the service.
      // For now, let's at least update the statut which is the most common use case.
      this.svc.changerStatut(this.candidatureId()!, val.statut as any).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route }),
        error: err => {
          this.loading.set(false);
          this.errorMsg.set(err.error?.message ?? "Erreur lors de la mise à jour.");
        }
      });
    } else {
      // POST new candidature
      this.svc.postuler({
        offreStageId: +val.offreStageId!,
        lettreMotivation: val.lettreMotivation!,
        // We'd ideally pass etudiantId if the backend allows admins to create on behalf of students,
        // but the standard postuler endpoint uses the logged-in user.
        // We will just call postuler for now. 
      }).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route }),
        error: err => {
          this.loading.set(false);
          this.errorMsg.set(err.error?.message ?? "Erreur lors de l'enregistrement.");
        }
      });
    }
  }
}
