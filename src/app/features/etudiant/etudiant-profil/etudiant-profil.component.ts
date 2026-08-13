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
        <h1 class="page-title">Mon profil</h1>
        <p class="page-subtitle">Gérez vos informations personnelles</p>
      </div>
    </div>

    <div class="profil-layout">
      <div class="profil-card card">
        <div class="profil-avatar-wrap">
          <div class="profil-avatar">{{ initials() }}</div>
          <h2>{{ userName() }}</h2>
          <p class="profil-email">{{ auth.currentUser()?.email }}</p>
          <span class="badge badge-success">Étudiant</span>
        </div>
      </div>

      <div class="card flex-1">
        <div class="card-header"><h3>Informations du compte</h3></div>
        <div class="card-body">
          @if (successMsg()) {
            <div class="alert alert-success" style="margin-bottom:1rem" role="status">{{ successMsg() }}</div>
          }
          @if (errorMsg()) {
            <div class="alert alert-danger" style="margin-bottom:1rem" role="alert">{{ errorMsg() }}</div>
          }
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row" style="margin-bottom:1rem">
              <div class="form-group">
                <label class="form-label" for="prof-nom">Nom</label>
                <input id="prof-nom" type="text" class="form-control" formControlName="nom"/>
                @if (f['nom'].invalid && f['nom'].touched) {
                  <span class="form-error">Nom requis</span>
                }
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-prenom">Prénom</label>
                <input id="prof-prenom" type="text" class="form-control" formControlName="prenom"/>
                @if (f['prenom'].invalid && f['prenom'].touched) {
                  <span class="form-error">Prénom requis</span>
                }
              </div>
            </div>
            <div class="form-group" style="margin-bottom:1rem">
              <label class="form-label" for="prof-email">Adresse e-mail</label>
              <input id="prof-email" type="email" class="form-control" formControlName="email"/>
              @if (f['email'].invalid && f['email'].touched) {
                <span class="form-error">E-mail valide requis</span>
              }
            </div>
            <div class="form-group" style="margin-bottom:1.5rem">
              <label class="form-label" for="prof-pwd">Nouveau mot de passe (optionnel)</label>
              <input id="prof-pwd" type="password" class="form-control" formControlName="motDePasse" placeholder="Laisser vide pour ne pas changer"/>
            </div>
            <div style="display:flex;justify-content:flex-end">
              <button type="submit" class="btn btn-primary" [disabled]="loading()">
                @if (loading()) { <span class="spinner"></span> }
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profil-layout { display:grid; grid-template-columns:280px 1fr; gap:1.5rem; align-items:start; }
    @media(max-width:768px) { .profil-layout { grid-template-columns:1fr; } }
    .profil-card { padding:2rem; text-align:center; }
    .profil-avatar-wrap { display:flex; flex-direction:column; align-items:center; gap:0.5rem; }
    .profil-avatar { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; color:white; font-size:1.75rem; font-weight:800; margin-bottom:0.5rem; }
    h2 { font-size:1.1rem; font-weight:700; color:#111827; }
    .profil-email { font-size:0.8rem; color:#6b7280; }
    .flex-1 { flex:1; }
  `]
})
export class EtudiantProfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected auth = inject(AuthService);

  loading    = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg   = signal<string | null>(null);

  form = this.fb.group({
    nom:        ['', Validators.required],
    prenom:     ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    motDePasse: ['']
  });

  get f() { return this.form.controls; }

  userName() { const u = this.auth.currentUser(); return u ? `${u.prenom} ${u.nom}` : ''; }
  initials() { const u = this.auth.currentUser(); return u ? `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() : '?'; }

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) { this.form.patchValue({ nom: u.nom, prenom: u.prenom, email: u.email }); }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    // Profile update would call a user service endpoint
    setTimeout(() => {
      this.loading.set(false);
      this.successMsg.set('Profil mis à jour avec succès !');
      setTimeout(() => this.successMsg.set(null), 3000);
    }, 800);
  }
}
