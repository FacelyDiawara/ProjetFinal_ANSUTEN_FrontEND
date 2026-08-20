import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { EntrepriseService } from '../../../services/entreprise.service';

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

        <div class="card profil-tips-card">
          <div class="tips-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <h4>Compléter votre profil</h4>
          </div>
          <ul class="tips-list">
            @for (tip of profileTips; track tip) {
              <li>
                <div class="tip-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>{{ tip }}</span>
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

    .profil-id-card { padding:2.5rem 2rem; text-align:center; position: relative; overflow: hidden; border: none; }
    .profil-id-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 100px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); z-index: 0; }
    .profil-avatar-wrap { position: relative; z-index: 1; display:flex; flex-direction:column; align-items:center; gap:0.5rem; padding-bottom:1.5rem; border-bottom:1px dashed #e2e8f0; margin-bottom:1.5rem; }
    .profil-avatar-ring { padding:5px; border-radius:50%; background:white; box-shadow:0 8px 20px rgba(6,182,212,0.15); margin-bottom:0.75rem; }
    .profil-avatar { width:88px; height:88px; border-radius:50%; background:linear-gradient(135deg,#06b6d4,#0284c7); display:flex; align-items:center; justify-content:center; color:white; font-size:2rem; font-weight:800; border:4px solid white; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
    .profil-name { font-size:1.25rem; font-weight:800; color:#0f172a; margin-top: 0.25rem; }
    .profil-email { font-size:0.85rem; color:#64748b; }

    .profil-status { display:flex; justify-content:center; position: relative; z-index: 1; }
    .status-indicator { display:inline-flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:#047857; font-weight:700; background:#d1fae5; padding:0.4rem 1rem; border-radius:9999px; }
    .status-dot { width:8px; height:8px; border-radius:50%; background:#10b981; animation:pulse 2s infinite; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
    @keyframes pulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.6; transform:scale(1.1)} }

    .profil-tips-card { margin-top:1.25rem; padding:1.5rem; border: none; background: #f8fafc; }
    .tips-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:1.25rem; color:#0f172a; h4 { font-size:0.9rem; font-weight:700; margin:0; } svg { color:#10b981; } }
    .tips-list { list-style:none; display:flex; flex-direction:column; gap:0.875rem; }
    .tips-list li { display:flex; align-items:flex-start; gap:0.75rem; font-size:0.85rem; color:#475569; line-height:1.4; }
    .tip-check { flex-shrink:0; width:18px; height:18px; border-radius:50%; background:#d1fae5; color:#059669; display:flex; align-items:center; justify-content:center; margin-top: 0.1rem; }

    .profil-main { display:flex; flex-direction:column; }
  `]
})
export class EntrepriseProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected auth = inject(AuthService);
  private entrepriseSvc = inject(EntrepriseService);

  loading    = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);
  isEdit     = signal(false);
  entrepriseId = signal<number | null>(null);

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
    if (u) { 
      this.form.patchValue({ nom: u.nom, prenom: u.prenom, email: u.email }); 
      if (u.id) {
        this.entrepriseSvc.getByUtilisateur(u.id).subscribe({
          next: (ent) => {
            this.isEdit.set(true);
            this.entrepriseId.set(ent.id!);
            this.form.patchValue({
              raisonSociale: ent.raisonSociale,
              secteurActivite: ent.secteurActivite,
              adresse: ent.adresse,
              siteWeb: ent.siteWeb
            });
          },
          error: () => {
            // Not found, will be created on submit
          }
        });
      }
    }
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
    
    const u = this.auth.currentUser();
    if (!u || !u.id) {
      this.loading.set(false);
      this.errorMsg.set('Utilisateur non connecté ou ID manquant');
      return;
    }
    
    const val = this.form.getRawValue();
    const payload = {
      raisonSociale: val.raisonSociale,
      secteurActivite: val.secteurActivite,
      adresse: val.adresse,
      siteWeb: val.siteWeb,
      utilisateurId: Number(u.id)
    };

    console.log('Payload entreprise :', payload);

    const req = this.isEdit() 
      ? this.entrepriseSvc.update(this.entrepriseId()!, payload as any)
      : this.entrepriseSvc.create(payload as any);
      
    req.subscribe({
      next: (ent) => {
        this.loading.set(false);
        this.successMsg.set('✅ Profil mis à jour avec succès !');
        this.isEdit.set(true);
        if (ent && ent.id) this.entrepriseId.set(ent.id);
        setTimeout(() => this.successMsg.set(null), 4000);
      },
      error: (error) => {
        this.loading.set(false);
        console.log('Erreur backend :', error);
        if (error.status === 400 && error.error?.message) {
          this.errorMsg.set(error.error.message);
        } else if (error.error?.message) {
          this.errorMsg.set(error.error.message);
        } else {
          this.errorMsg.set("Erreur lors de l'enregistrement.");
        }
      }
    });
  }
}
