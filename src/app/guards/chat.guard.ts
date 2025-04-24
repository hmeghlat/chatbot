import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}


  canActivate(): boolean {
    // Utilisation de la clé "jwt" pour récupérer le token
    const token = this.cookieService.get('jwt');

    if (token && !this.isTokenExpired(token)) {
      return true;
    } else {
      this.router.navigate(['/login']); // Redirige si le token est invalide ou absent
      return false;
    }
  }

  /**
   * Vérifie si le token est expiré (uniquement si c'est un JWT).
   * @param token Le token JWT stocké dans localStorage
   * @returns true si le token est expiré, false sinon
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Décode le payload du JWT
      const expiry = payload.exp * 1000; // Convertir en millisecondes
      return Date.now() > expiry; // Vérifie si la date actuelle dépasse la date d'expiration
    } catch (e) {
      return true; // Si le token est invalide, on considère qu'il est expiré
    }
  }
}
