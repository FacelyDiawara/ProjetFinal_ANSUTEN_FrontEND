export interface Entreprise {
  id?: number;
  raisonSociale: string;
  secteurActivite: string;
  adresse: string;
  telephone: string;
  email: string;
  utilisateur?: {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
  statut?: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
}
