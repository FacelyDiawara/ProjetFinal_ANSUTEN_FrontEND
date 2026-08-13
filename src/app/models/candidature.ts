export type StatutCandidature = 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE';

export interface Candidature {
  id?: number;
  dateSoumission?: string;
  lettreMotivation: string;
  statut: StatutCandidature;
  etudiant?: {
    id?: number;
    matricule: string;
    utilisateur?: { nom: string; prenom: string; email: string };
  };
  offreStage?: {
    id?: number;
    titre: string;
    entreprise?: { raisonSociale: string };
  };
  etudiantId?: number;
  offreStageId?: number;
}
