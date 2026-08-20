export interface Entreprise {
  id?: number;
  raisonSociale: string;
  secteurActivite: string;
  adresse: string;
  siteWeb?: string;
  statutValidation?: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  utilisateurId?: number;
}
