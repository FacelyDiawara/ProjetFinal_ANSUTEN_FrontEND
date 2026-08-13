import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Candidature } from '../models/candidature';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/candidatures`;

  getAll()            { return this.http.get<Candidature[]>(this.base); }
  getById(id: number) { return this.http.get<Candidature>(`${this.base}/${id}`); }

  getByEtudiant(etudiantId: number) {
    return this.http.get<Candidature[]>(`${this.base}/etudiant/${etudiantId}`);
  }

  getByOffre(offreId: number) {
    return this.http.get<Candidature[]>(`${this.base}/offre/${offreId}`);
  }

  postuler(candidature: Partial<Candidature>) {
    return this.http.post<Candidature>(this.base, candidature);
  }

  changerStatut(id: number, statut: string) {
    return this.http.patch<Candidature>(`${this.base}/${id}/statut`, { statut });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
