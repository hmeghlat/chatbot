import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private BASE_URL = 'http://127.0.0.1:5000'; // ✅ À adapter si tu passes en prod

  constructor(private http: HttpClient) {}

  /** 🔐 Génère les headers avec le JWT */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /** ✅ Envoie les réponses pour générer des questions personnalisées */
  generateQuestions(responses: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/generate_questions`,
      { responses: responses }, // 👈 bien encapsulé dans un objet
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Envoie les réponses finales pour analyse */
  analyzeResponses(responses: string[]): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/chat`,
      { responses: responses },
      { headers: this.getAuthHeaders() }
    );
  }
}
