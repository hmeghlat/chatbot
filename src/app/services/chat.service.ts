import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private BASE_URL = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('jwt');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  sendMessage(message: string, finalize: boolean = false): Observable<any> {
    return this.http.post<any>(
      `${this.BASE_URL}/chat`,
      { message, finalize },
      { headers: this.getAuthHeaders() }
    );
  }

  getConversations(): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/conversations`,
      { headers: this.getAuthHeaders() }
    );
  }

  getConversationById(convId: string): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/conversations/${convId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
