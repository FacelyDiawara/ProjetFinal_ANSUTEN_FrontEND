import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OffreStage } from '../models/offre-stage';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OffreStageService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/offres`;

  getAll()       { return this.http.get<OffreStage[]>(this.base); }
  getValides()   { return this.http.get<OffreStage[]>(`${this.base}/valides`); }
  getById(id: number) { return this.http.get<OffreStage>(`${this.base}/${id}`); }
  getByEntreprise(entrepriseId: number) {
    return this.http.get<OffreStage[]>(`${this.base}/entreprise/${entrepriseId}`);
  }

  create(offre: Partial<OffreStage>) {
    return this.http.post<OffreStage>(this.base, offre);
  }

  update(id: number, offre: Partial<OffreStage>) {
    return this.http.put<OffreStage>(`${this.base}/${id}`, offre);
  }

  changerStatut(id: number, statut: string) {
    return this.http.patch<OffreStage>(`${this.base}/${id}/statut`, { statut });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
