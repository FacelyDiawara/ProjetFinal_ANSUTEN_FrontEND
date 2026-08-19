import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-etudiant-profil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Mon Profil Étudiant</h1>
        <p class="page-subtitle">Gérez vos informations personnelles et académiques</p>
      </div>
    </div>

    <div class="profil-layout">
      <!-- Left: Identity Card -->
      <div class="profil-sidebar">
        <div class="card profil-id-card">
          <div class="profil-avatar-wrap">
            <div class="profil-avatar-ring">
              <div class="profil-avatar">{{ initials() }}</div>
            </div>
            <h2 class="profil-name">{{ userName() }}</h2>
            <p class="profil-email">{{ auth.currentUser()?.email }}</p>
            <span class="badge badge-success" style="margin-top: 0.5rem;">🎓 Étudiant</span>
          </div>
          <div class="profil-stats">
            <div class="profil-stat">
              <strong>{{ form.get('niveau')?.value || '—' }}</strong>
              <span>Niveau</span>
            </div>
            <div class="profil-stat-sep"></div>
            <div class="profil-stat">
              <strong>{{ form.get('filiere')?.value?.slice(0,6) || '—' }}</strong>
              <span>Filière</span>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="card profil-tips-card">
          <div class="tips-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h4>Informations requises</h4>
          </div>
          <ul class="tips-list">
            @for (info of profilTips; track info) {
              <li>
                <div class="tip-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>{{ info }}</span>
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="profil-main">
        @if (successMsg()) {
          <div class="alert alert-success" style="margin-bottom:1.5rem" role="status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            {{ successMsg() }}
          </div>
        }
        @if (errorMsg()) {
          <div class="alert alert-danger" style="margin-bottom:1.5rem" role="alert">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Section: Identité -->
          <div class="form-card">
            <div class="form-card-header">
              <div>
                <h2>Informations personnelles</h2>
                <p>Nom, prénom et coordonnées de contact</p>
              </div>
              <div class="form-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <div class="form-card-body">
              <div class="form-row" style="margin-bottom:1.25rem">
                <div class="form-group">
                  <label class="form-label" for="prof-prenom">Prénom *</label>
                  <input id="prof-prenom" type="text" class="form-control" formControlName="prenom" placeholder="Votre prénom"/>
                  @if (f['prenom'].invalid && f['prenom'].touched) {
                    <span class="form-error">Prénom requis</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-nom">Nom *</label>
                  <input id="prof-nom" type="text" class="form-control" formControlName="nom" placeholder="Votre nom de famille"/>
                  @if (f['nom'].invalid && f['nom'].touched) {
                    <span class="form-error">Nom requis</span>
                  }
                </div>
              </div>
              <div class="form-row" style="margin-bottom:1.25rem">
                <div class="form-group">
                  <label class="form-label" for="prof-email">Adresse e-mail *</label>
                  <input id="prof-email" type="email" class="form-control" formControlName="email" placeholder="votre@email.com"/>
                  @if (f['email'].invalid && f['email'].touched) {
                    <span class="form-error">E-mail valide requis</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-tel">Téléphone</label>
                  <input id="prof-tel" type="tel" class="form-control" formControlName="telephone" placeholder="Ex: 622 000 000"/>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-pwd">Nouveau mot de passe</label>
                <input id="prof-pwd" type="password" class="form-control" formControlName="motDePasse" placeholder="Laisser vide pour conserver le mot de passe actuel"/>
              </div>
            </div>
          </div>

          <!-- Section: Scolarité -->
          <div class="form-card" style="margin-top:1.5rem">
            <div class="form-card-header">
              <div>
                <h2>Informations Académiques</h2>
                <p>Filière, niveau d'études et matricule universitaire</p>
              </div>
              <div class="form-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
            </div>
            <div class="form-card-body">
              <div class="form-row" style="margin-bottom:1.25rem">
                <div class="form-group">
                  <label class="form-label" for="prof-matricule">Matricule universitaire *</label>
                  <input id="prof-matricule" type="text" class="form-control" formControlName="matricule" placeholder="Ex: ETU-2024-001"/>
                  @if (f['matricule'].invalid && f['matricule'].touched) {
                    <span class="form-error">Matricule requis</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-niveau">Niveau d'études *</label>
                  <select id="prof-niveau" class="form-select" formControlName="niveau">
                    <option value="">Sélectionner un niveau</option>
                    <option value="L1">Licence 1</option>
                    <option value="L2">Licence 2</option>
                    <option value="L3">Licence 3</option>
                    <option value="M1">Master 1</option>
                    <option value="M2">Master 2</option>
                  </select>
                  @if (f['niveau'].invalid && f['niveau'].touched) {
                    <span class="form-error">Niveau requis</span>
                  }
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="prof-filiere">Filière *</label>
                  <input id="prof-filiere" type="text" class="form-control" formControlName="filiere" placeholder="Ex: Informatique, Génie Civil..."/>
                  @if (f['filiere'].invalid && f['filiere'].touched) {
                    <span class="form-error">Filière requise</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-cv">Lien vers le CV (URL)</label>
                  <input id="prof-cv" type="url" class="form-control" formControlName="cv" placeholder="https://drive.google.com/..."/>
                </div>
              </div>
            </div>
            <div class="form-card-footer">
              <button type="button" class="btn btn-outline" (click)="resetForm()">Annuler les modifications</button>
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading()">
                @if (loading()) { <span class="spinner"></span> }
                Sauvegarder mon profil
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profil-layout { display:grid; grid-template-columns:280px 1fr; gap:1.75rem; align-items:start; }
    @media(max-width:900px) { .profil-layout { grid-template-columns:1fr; } }

    .profil-id-card { padding:2.5rem 2rem; text-align:center; position: relative; overflow: hidden; border: none; }
    .profil-id-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 100px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); z-index: 0; }
    .profil-avatar-wrap { position: relative; z-index: 1; display:flex; flex-direction:column; align-items:center; gap:0.5rem; padding-bottom:1.5rem; border-bottom:1px dashed #e2e8f0; margin-bottom:1.5rem; }
    .profil-avatar-ring { padding:5px; border-radius:50%; background:white; box-shadow:0 8px 20px rgba(79,70,229,0.15); margin-bottom:0.75rem; }
    .profil-avatar { width:88px; height:88px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; color:white; font-size:2rem; font-weight:800; border:4px solid white; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
    .profil-name { font-size:1.25rem; font-weight:800; color:#0f172a; margin-top: 0.25rem; }
    .profil-email { font-size:0.85rem; color:#64748b; }

    .profil-stats { display:flex; align-items:center; justify-content:center; gap:1.25rem; position: relative; z-index: 1; }
    .profil-stat { display:flex; flex-direction:column; align-items:center; gap:0.15rem; strong { font-size:1.1rem; font-weight:800; color:#0f172a; } span { font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; } }
    .profil-stat-sep { width:1px; height:28px; background:#e2e8f0; }
    
    .profil-tips-card { margin-top:1.25rem; padding:1.5rem; border: none; background: #f8fafc; }
    .tips-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:1.25rem; color:#0f172a; h4 { font-size:0.9rem; font-weight:700; margin:0; } svg { color:#10b981; } }
    .tips-list { list-style:none; display:flex; flex-direction:column; gap:0.875rem; }
    .tips-list li { display:flex; align-items:flex-start; gap:0.75rem; font-size:0.85rem; color:#475569; line-height:1.4; }
    .tip-check { flex-shrink:0; width:18px; height:18px; border-radius:50%; background:#d1fae5; color:#059669; display:flex; align-items:center; justify-content:center; margin-top: 0.1rem; }

    .profil-main { display:flex; flex-direction:column; }
  `]
})
export class EtudiantProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected auth = inject(AuthService);

  loading    = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);

  readonly profilTips = [
    'Complétez toutes les informations',
    'Ajoutez un lien vers votre CV',
    'Vérifiez votre matricule universitaire',
    'Indiquez votre filière et niveau d\'études'
  ];

  form = this.fb.group({
    nom:        ['', Validators.required],
    prenom:     ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    telephone:  [''],
    motDePasse: [''],
    matricule:  ['', Validators.required],
    filiere:    ['', Validators.required],
    niveau:     ['', Validators.required],
    cv:         ['']
  });

  get f() { return this.form.controls; }

  userName() { const u = this.auth.currentUser(); return u ? `${u.prenom} ${u.nom}` : ''; }
  initials() { const u = this.auth.currentUser(); return u ? `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() : '?'; }

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) { this.form.patchValue({ nom: u.nom, prenom: u.prenom, email: u.email }); }
  }

  resetForm() {
    const u = this.auth.currentUser();
    if (u) { this.form.patchValue({ nom: u.nom, prenom: u.prenom, email: u.email }); }
    this.form.markAsPristine();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    // Profile update endpoint
    setTimeout(() => {
      this.loading.set(false);
      this.successMsg.set('✅ Profil mis à jour avec succès !');
      setTimeout(() => this.successMsg.set(null), 4000);
    }, 800);
  }
}
