import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private BASE_URL = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  /** 🔐 Génère les headers avec le JWT */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /** 🧠 Envoie un message utilisateur pour obtenir une réponse du bot */
  sendMessage(message: string, finalize: boolean = false): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/chat`,
      { message, finalize },
      { headers: this.getAuthHeaders() }
    );
  }

  
}
