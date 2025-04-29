import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap, mergeMap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ConversationDetail } from '../chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private BASE_URL = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('jwt');
    const guestToken = this.cookieService.get('guest_session');
    
    // Si c'est un utilisateur invité, utiliser un header spécial
    if (!token && guestToken) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Guest-Session': guestToken
      });
    }
    
    // Sinon, utiliser le token JWT
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private isGuestUser(): boolean {
    const token = this.cookieService.get('jwt');
    const guestToken = this.cookieService.get('guest_session');
    return !token && !!guestToken;
  }

  // Pour enregistrer un utilisateur invité et obtenir un token JWT temporaire
  registerGuestUser(): Observable<any> {
    // L'utilisateur a un cookie de session invité mais pas de token JWT
    if (this.isGuestUser()) {
      console.log('Registering guest user with the server');
      return this.http.post<any>(
        `${this.BASE_URL}/guest`, 
        {}
      ).pipe(
        tap(response => {
          if (response && response.access_token) {
            // Stocker le token JWT temporaire
            this.cookieService.set('jwt', response.access_token, { path: '/' });
            console.log('Guest JWT token stored');
          }
        })
      );
    }
    return of({ status: 'already_registered' });
  }

  sendMessage(message: string, finalize: boolean = false): Observable<any> {
    // Vérifier si l'utilisateur est un invité et s'il a besoin d'être enregistré
    if (this.isGuestUser()) {
      // Enregistrer l'utilisateur invité d'abord, puis envoyer le message
      return this.registerGuestUser().pipe(
        tap(response => console.log('Guest registration response:', response)),
        // Après l'enregistrement, envoyer le message avec le nouveau token JWT
        // On utilise le même endpoint car maintenant l'utilisateur a un token
        tap(() => console.log('Sending message with new guest JWT token')),
        mergeMap(() => this.http.post<any>(
          `${this.BASE_URL}/chat`,
          { message, finalize },
          { headers: this.getAuthHeaders() }
        ))
      );
    }

    // Pour les utilisateurs normaux, envoyer directement le message
    return this.http.post<any>(
      `${this.BASE_URL}/chat`,
      { message, finalize },
      { headers: this.getAuthHeaders() }
    );
  }

  getConversations(): Observable<any> {
    // Pour les invités, on retourne une liste vide
    if (this.isGuestUser()) {
      console.log('Guest user, returning empty conversation history');
      return of([]);
    }

    return this.http.get<any>(
      `${this.BASE_URL}/conversations`,
      { headers: this.getAuthHeaders() }
    );
  }

  getConversationById(convId: string): Observable<ConversationDetail> {
    // Pour les invités, on ne permet pas d'accéder à des conversations spécifiques
    if (this.isGuestUser()) {
      console.log('Guest user cannot access specific conversations');
      return of({ messages: [] });
    }

    return this.http.get<ConversationDetail>(
      `${this.BASE_URL}/conversations/${convId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
