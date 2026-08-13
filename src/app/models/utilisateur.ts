export type Role = 'ETUDIANT' | 'ENTREPRISE' | 'ADMIN';

export interface Utilisateur {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  role: Role;
}

export interface AuthRequest {
  email: string;
  motDePasse: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: Utilisateur;
}
