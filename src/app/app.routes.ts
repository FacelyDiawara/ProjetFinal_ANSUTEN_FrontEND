import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard, entrepriseGuard, etudiantGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ── Public ─────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth/login',
    // canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    // canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // ── Error pages ─────────────────────────────────────────────────────
  {
    path: '403',
    loadComponent: () => import('./features/errors/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent)
  },

  // ── Admin ────────────────────────────────────────────────────────────
  {
    path: 'admin',
    // canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'offres',
        loadComponent: () => import('./features/offres/offres-list/offres-list.component').then(m => m.OffresListComponent)
      },
      {
        path: 'offres/nouvelle',
        loadComponent: () => import('./features/offres/offre-form/offre-form.component').then(m => m.OffreFormComponent)
      },
      {
        path: 'offres/:id',
        loadComponent: () => import('./features/offres/offre-detail/offre-detail.component').then(m => m.OffreDetailComponent)
      },
      {
        path: 'offres/:id/modifier',
        loadComponent: () => import('./features/offres/offre-form/offre-form.component').then(m => m.OffreFormComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () => import('./features/candidatures/candidatures-list/candidatures-list.component').then(m => m.CandidaturesListComponent)
      },
      {
        path: 'etudiants',
        loadComponent: () => import('./features/etudiants/etudiants-list/etudiants-list.component').then(m => m.EtudiantsListComponent)
      },
      {
        path: 'entreprises',
        loadComponent: () => import('./features/entreprises/entreprises-list/entreprises-list.component').then(m => m.EntreprisesListComponent)
      },
      {
        path: 'stats',
        loadComponent: () => import('./features/admin/admin-stats/admin-stats.component').then(m => m.AdminStatsComponent)
      }
    ]
  },

  // ── Entreprise ───────────────────────────────────────────────────────
  {
    path: 'entreprise',
    // canActivate: [authGuard, entrepriseGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/entreprise/entreprise-dashboard/entreprise-dashboard.component').then(m => m.EntrepriseDashboardComponent)
      },
      {
        path: 'offres',
        loadComponent: () => import('./features/offres/offres-list/offres-list.component').then(m => m.OffresListComponent)
      },
      {
        path: 'offres/nouvelle',
        loadComponent: () => import('./features/offres/offre-form/offre-form.component').then(m => m.OffreFormComponent)
      },
      {
        path: 'offres/:id',
        loadComponent: () => import('./features/offres/offre-detail/offre-detail.component').then(m => m.OffreDetailComponent)
      },
      {
        path: 'offres/:id/modifier',
        loadComponent: () => import('./features/offres/offre-form/offre-form.component').then(m => m.OffreFormComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () => import('./features/candidatures/candidatures-list/candidatures-list.component').then(m => m.CandidaturesListComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/entreprise/entreprise-profil/entreprise-profil.component').then(m => m.EntrepriseProfilComponent)
      }
    ]
  },

  // ── Étudiant ─────────────────────────────────────────────────────────
  {
    path: 'etudiant',
    // canActivate: [authGuard, etudiantGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/etudiant/etudiant-dashboard/etudiant-dashboard.component').then(m => m.EtudiantDashboardComponent)
      },
      {
        path: 'offres',
        loadComponent: () => import('./features/offres/offres-list/offres-list.component').then(m => m.OffresListComponent)
      },
      {
        path: 'offres/:id',
        loadComponent: () => import('./features/offres/offre-detail/offre-detail.component').then(m => m.OffreDetailComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () => import('./features/candidatures/candidatures-list/candidatures-list.component').then(m => m.CandidaturesListComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/etudiant/etudiant-profil/etudiant-profil.component').then(m => m.EtudiantProfilComponent)
      }
    ]
  },

  // ── Wildcard ─────────────────────────────────────────────────────────
  { path: '**', redirectTo: '404' }
];
