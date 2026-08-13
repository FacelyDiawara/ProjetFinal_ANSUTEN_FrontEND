export type StatutOffre = 'OUVERTE' | 'FERMEE';

export interface OffreStage {
  id?: number;
  titre: string;
  description: string;
  competencesRequises: string;
  dateDebut: string;
  dateFin?: string;
  duree?: number;
  lieu?: string;
  statut: StatutOffre;
  entreprise?: {
    id?: number;
    raisonSociale: string;
    secteurActivite: string;
  };
  entrepriseId?: number;
  nombreCandidatures?: number;
}
