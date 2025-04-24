
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthCookieService {
  private readonly tokenKey = 'jwt_token';

  constructor(private cookieService: CookieService) {}

  setToken(token: string) {
    this.cookieService.set(this.tokenKey, token, { sameSite: 'Lax', path: '/' });
  }

  getToken(): string {
    return this.cookieService.get(this.tokenKey);
  }

  deleteToken() {
    this.cookieService.delete(this.tokenKey, '/');
  }

  isTokenAvailable(): boolean {
    return this.cookieService.check(this.tokenKey);
  }
}
