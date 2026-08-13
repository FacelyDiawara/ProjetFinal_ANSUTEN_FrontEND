import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Etudiant } from '../models/etudiant';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EtudiantService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/etudiants`;

  getAll()            { return this.http.get<Etudiant[]>(this.base); }
  getById(id: number) { return this.http.get<Etudiant>(`${this.base}/${id}`); }
  getByUtilisateur(userId: number) {
    return this.http.get<Etudiant>(`${this.base}/utilisateur/${userId}`);
  }

  create(e: Partial<Etudiant>) { return this.http.post<Etudiant>(this.base, e); }
  update(id: number, e: Partial<Etudiant>) { return this.http.put<Etudiant>(`${this.base}/${id}`, e); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
