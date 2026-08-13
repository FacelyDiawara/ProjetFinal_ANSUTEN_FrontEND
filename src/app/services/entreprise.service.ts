import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entreprise } from '../models/entreprise';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EntrepriseService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/entreprises`;

  getAll()            { return this.http.get<Entreprise[]>(this.base); }
  getById(id: number) { return this.http.get<Entreprise>(`${this.base}/${id}`); }
  getByUtilisateur(userId: number) {
    return this.http.get<Entreprise>(`${this.base}/utilisateur/${userId}`);
  }

  create(e: Partial<Entreprise>) { return this.http.post<Entreprise>(this.base, e); }
  update(id: number, e: Partial<Entreprise>) { return this.http.put<Entreprise>(`${this.base}/${id}`, e); }
  valider(id: number) { return this.http.patch<Entreprise>(`${this.base}/${id}/valider`, {}); }
  rejeter(id: number) { return this.http.patch<Entreprise>(`${this.base}/${id}/rejeter`, {}); }
  delete(id: number)  { return this.http.delete<void>(`${this.base}/${id}`); }
}
