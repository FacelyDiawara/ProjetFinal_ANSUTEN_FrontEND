export interface Etudiant {
  id?: number;
  matricule: string;
  filiere: string;
  niveau: string;
  telephone?: string;
  cv?: string;
  utilisateur?: {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
  utilisateurId?: number;
}
