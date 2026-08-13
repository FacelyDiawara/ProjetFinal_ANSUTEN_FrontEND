import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">

      <!-- ── Sidebar ─────────────────────────────── -->
      <aside class="sidebar" [attr.aria-label]="'Navigation principale'">
        <div class="sidebar-header">
          <a routerLink="." class="sidebar-brand">
            <div class="sidebar-logo">
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="url(#lg)"/>
                <path d="M8 26L18 10L28 26H8Z" fill="white" opacity="0.9"/>
                <circle cx="18" cy="18" r="4" fill="white"/>
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#4f46e5"/><stop offset="1" stop-color="#7c3aed"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span class="sidebar-brand-text">UniStage</span>
          </a>
          <button class="collapse-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())"
            [attr.aria-label]="sidebarCollapsed() ? 'Ouvrir le menu' : 'Réduire le menu'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>

        <!-- Role badge -->
        <div class="role-badge">
          <span class="badge" [class]="roleBadgeClass()">{{ roleLabel() }}</span>
        </div>

        <nav class="sidebar-nav" aria-label="Menu principal">
          @for (item of navItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              [title]="item.label"
            >
              <span class="nav-icon" [innerHTML]="item.icon" aria-hidden="true"></span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar">{{ userInitials() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-email">{{ userEmail() }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" title="Déconnexion" aria-label="Se déconnecter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      <!-- ── Main content ─────────────────────────── -->
      <div class="main-wrapper">
        <header class="topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())"
              aria-label="Basculer le menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
          </div>
          <div class="topbar-right">
            <div class="topbar-user">
              <div class="avatar avatar-sm">{{ userInitials() }}</div>
              <span class="topbar-user-name">{{ userName() }}</span>
            </div>
          </div>
        </header>

        <main class="main-content" id="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100dvh; }

    .layout {
      display: flex;
      height: 100%;
      overflow: hidden;
    }

    /* ── Sidebar ───────────────────────────────────── */
    .sidebar {
      width: 260px;
      height: 100%;
      background: linear-gradient(180deg, #1e1b4b 0%, #1e1b4b 60%, #1a1730 100%);
      display: flex;
      flex-direction: column;
      transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      z-index: 100;
    }

    .layout.sidebar-collapsed .sidebar {
      width: 68px;
      .sidebar-brand-text, .nav-label, .user-meta, .role-badge { display: none; }
      .sidebar-brand { justify-content: center; }
      .user-info { justify-content: center; }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      flex: 1;
      overflow: hidden;
    }

    .sidebar-logo {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(79,70,229,0.4);
    }

    .sidebar-brand-text {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.1rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }

    .collapse-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.5);
      flex-shrink: 0;
      transition: all 0.2s;
      &:hover { background: rgba(255,255,255,0.08); color: white; }
    }

    .role-badge {
      padding: 0.625rem 1rem 0;
      .badge { font-size: 0.65rem; padding: 0.2rem 0.6rem; }
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.18s;
      white-space: nowrap;

      &:hover {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.9);
      }

      &.active {
        background: linear-gradient(90deg, rgba(79,70,229,0.35) 0%, rgba(79,70,229,0.1) 100%);
        color: white;
        border-left: 2.5px solid #818cf8;
      }
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      flex: 1;
      overflow: hidden;
      min-width: 0;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.78rem;
      flex-shrink: 0;
    }

    .avatar-sm { width: 30px; height: 30px; font-size: 0.72rem; }

    .user-meta {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255,255,255,0.9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.45);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      padding: 0.5rem;
      border-radius: 7px;
      color: rgba(255,255,255,0.4);
      flex-shrink: 0;
      transition: all 0.2s;
      &:hover { background: rgba(239,68,68,0.15); color: #ef4444; }
    }

    /* ── Main wrapper ──────────────────────────────── */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .topbar {
      height: 56px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .topbar-left { display: flex; align-items: center; gap: 1rem; }
    .topbar-right { display: flex; align-items: center; gap: 1rem; }

    .mobile-menu-btn {
      display: none;
      padding: 0.375rem;
      color: #6b7280;
      border-radius: 6px;
      &:hover { background: #f3f4f6; }

      @media (max-width: 768px) { display: flex; align-items: center; }
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .topbar-user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.75rem;
      background: #f9fafb;
    }

    @media (max-width: 768px) {
      .sidebar { position: fixed; z-index: 200; transform: translateX(-100%); }
      .layout:not(.sidebar-collapsed) .sidebar { transform: translateX(0); }
    }
  `]
})
export class LayoutComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);

  protected readonly ICONS = {
    dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`,
    offres:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>`,
    candidatures: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5-5v2H9v-2h4zm2-4v2H9v-2h6z"/></svg>`,
    etudiants: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`,
    entreprises: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm0-4H4V5h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z"/></svg>`,
    stats: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
    profil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
  };

  navItems() {
    const role = this.auth.role();
    if (role === 'ADMIN') return [
      { label: 'Tableau de bord', route: '/admin/dashboard',   icon: this.ICONS.dashboard },
      { label: 'Offres de stage', route: '/admin/offres',      icon: this.ICONS.offres },
      { label: 'Candidatures',   route: '/admin/candidatures', icon: this.ICONS.candidatures },
      { label: 'Étudiants',      route: '/admin/etudiants',    icon: this.ICONS.etudiants },
      { label: 'Entreprises',    route: '/admin/entreprises',  icon: this.ICONS.entreprises },
      { label: 'Statistiques',   route: '/admin/stats',        icon: this.ICONS.stats },
    ];
    if (role === 'ENTREPRISE') return [
      { label: 'Tableau de bord', route: '/entreprise/dashboard',    icon: this.ICONS.dashboard },
      { label: 'Mes offres',      route: '/entreprise/offres',       icon: this.ICONS.offres },
      { label: 'Candidatures',   route: '/entreprise/candidatures',  icon: this.ICONS.candidatures },
      { label: 'Mon profil',     route: '/entreprise/profil',        icon: this.ICONS.profil },
    ];
    return [
      { label: 'Tableau de bord', route: '/etudiant/dashboard',     icon: this.ICONS.dashboard },
      { label: 'Offres de stage', route: '/etudiant/offres',        icon: this.ICONS.offres },
      { label: 'Mes candidatures',route: '/etudiant/candidatures',  icon: this.ICONS.candidatures },
      { label: 'Mon profil',      route: '/etudiant/profil',        icon: this.ICONS.profil },
    ];
  }

  userName() {
    const u = this.auth.currentUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  }

  userEmail() { return this.auth.currentUser()?.email ?? ''; }

  userInitials() {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase();
  }

  roleLabel() {
    const map: Record<string, string> = {
      ADMIN: 'Administrateur', ENTREPRISE: 'Entreprise', ETUDIANT: 'Étudiant'
    };
    return map[this.auth.role() ?? ''] ?? '';
  }

  roleBadgeClass() {
    const map: Record<string, string> = {
      ADMIN: 'badge-danger', ENTREPRISE: 'badge-info', ETUDIANT: 'badge-success'
    };
    return map[this.auth.role() ?? ''] ?? 'badge-gray';
  }

  logout() { this.auth.logout(); }
}
