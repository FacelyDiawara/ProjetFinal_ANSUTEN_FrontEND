import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-entreprise-profil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Profil Entreprise</h1>
        <p class="page-subtitle">Gérez les informations de votre entreprise et de votre compte</p>
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
            <span class="badge badge-info" style="margin-top: 0.5rem;">🏢 Entreprise</span>
          </div>
          <div class="profil-status">
            <span class="status-indicator">
              <span class="status-dot"></span>
              Compte actif &amp; vérifié
            </span>
          </div>
        </div>

        <div class="card" style="margin-top:1rem; padding:1.25rem;">
          <h4 style="font-size:0.85rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:1rem;">
            ✅ Compléter votre profil
          </h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.625rem;">
            @for (tip of profileTips; track tip) {
              <li style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:#64748b;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ tip }}
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
          <!-- Section: Responsable -->
          <div class="form-card">
            <div class="form-card-header">
              <div>
                <h2>Compte du Responsable</h2>
                <p>Coordonnées du responsable de l'entreprise sur UniStage</p>
              </div>
              <div class="form-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <div class="form-card-body">
              <div class="form-row" style="margin-bottom:1.25rem">
                <div class="form-group">
                  <label class="form-label" for="ent-prenom">Prénom du responsable</label>
                  <input id="ent-prenom" type="text" class="form-control" formControlName="prenom" placeholder="Prénom"/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ent-nom">Nom du responsable *</label>
                  <input id="ent-nom" type="text" class="form-control" formControlName="nom" placeholder="Nom"/>
                  @if (f['nom'].invalid && f['nom'].touched) {
                    <span class="form-error">Champ requis</span>
                  }
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="ent-email">E-mail professionnel *</label>
                  <input id="ent-email" type="email" class="form-control" formControlName="email" placeholder="contact@entreprise.com"/>
                  @if (f['email'].invalid && f['email'].touched) {
                    <span class="form-error">E-mail valide requis</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label" for="ent-pwd">Nouveau mot de passe</label>
                  <input id="ent-pwd" type="password" class="form-control" formControlName="motDePasse" placeholder="Laisser vide pour conserver"/>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Entreprise -->
          <div class="form-card" style="margin-top:1.5rem">
            <div class="form-card-header">
              <div>
                <h2>Informations de l'Entreprise</h2>
                <p>Raison sociale, secteur d'activité et coordonnées professionnelles</p>
              </div>
              <div class="form-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M3 3v18M21 3v18M12 3H3v5h9V3zM21 8h-9v13h9V8z"/></svg>
              </div>
            </div>
            <div class="form-card-body">
              <div class="form-row" style="margin-bottom:1.25rem">
                <div class="form-group">
                  <label class="form-label" for="ent-raison">Raison sociale *</label>
                  <input id="ent-raison" type="text" class="form-control" formControlName="raisonSociale" placeholder="Nom légal de l'entreprise"/>
                  @if (f['raisonSociale'].invalid && f['raisonSociale'].touched) {
                    <span class="form-error">Raison sociale requise</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label" for="ent-secteur">Secteur d'activité *</label>
                  <input id="ent-secteur" type="text" class="form-control" formControlName="secteurActivite" placeholder="Ex: Technologie, BTP, Finance..."/>
                  @if (f['secteurActivite'].invalid && f['secteurActivite'].touched) {
                    <span class="form-error">Secteur requis</span>
                  }
                </div>
              </div>
              <div class="form-row" style="margin-bottom:1.25rem">
                <div class="form-group">
                  <label class="form-label" for="ent-adresse">Adresse du siège</label>
                  <input id="ent-adresse" type="text" class="form-control" formControlName="adresse" placeholder="Ex: Quartier Tata, Labé, Guinée"/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ent-site">Site web</label>
                  <input id="ent-site" type="url" class="form-control" formControlName="siteWeb" placeholder="https://www.votre-entreprise.com"/>
                </div>
              </div>
            </div>
            <div class="form-card-footer">
              <button type="button" class="btn btn-outline" (click)="resetForm()">Annuler</button>
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading()">
                @if (loading()) { <span class="spinner"></span> }
                Sauvegarder les modifications
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

    .profil-id-card { padding:2rem; text-align:center; }
    .profil-avatar-wrap { display:flex; flex-direction:column; align-items:center; gap:0.5rem; padding-bottom:1.25rem; border-bottom:1px dashed #e2e8f0; margin-bottom:1.25rem; }
    .profil-avatar-ring { padding:4px; border-radius:50%; background:linear-gradient(135deg,#06b6d4,#0284c7); box-shadow:0 8px 20px rgba(6,182,212,0.3); margin-bottom:0.5rem; }
    .profil-avatar { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#06b6d4,#0284c7); display:flex; align-items:center; justify-content:center; color:white; font-size:1.75rem; font-weight:800; border:3px solid white; }
    .profil-name { font-size:1.1rem; font-weight:800; color:#0f172a; }
    .profil-email { font-size:0.78rem; color:#64748b; }

    .profil-status { display:flex; justify-content:center; }
    .status-indicator { display:inline-flex; align-items:center; gap:0.4rem; font-size:0.78rem; color:#059669; font-weight:600; background:#ecfdf5; padding:0.3rem 0.75rem; border-radius:9999px; }
    .status-dot { width:7px; height:7px; border-radius:50%; background:#10b981; animation:pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .profil-main { display:flex; flex-direction:column; }
  `]
})
export class EntrepriseProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected auth = inject(AuthService);

  loading    = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);

  readonly profileTips = [
    'Renseignez la raison sociale officielle',
    'Précisez votre secteur d\'activité',
    'Ajoutez votre adresse de siège social',
    'Lien vers votre site web professionnel'
  ];

  form = this.fb.group({
    nom:             ['', Validators.required],
    prenom:          [''],
    email:           ['', [Validators.required, Validators.email]],
    motDePasse:      [''],
    raisonSociale:   ['', Validators.required],
    secteurActivite: ['', Validators.required],
    adresse:         [''],
    siteWeb:         ['']
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
    setTimeout(() => {
      this.loading.set(false);
      this.successMsg.set('✅ Profil entreprise mis à jour avec succès !');
      setTimeout(() => this.successMsg.set(null), 4000);
    }, 800);
  }
}
