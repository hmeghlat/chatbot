import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: CookieService
  ) {}

  canActivate(): boolean {
    // Vérifier si l'utilisateur a un JWT token ou un cookie de session invité
    const hasJwtToken = !!this.cookieService.get('jwt');
    const hasGuestSession = !!this.cookieService.get('guest_session');
    
    console.log('GuestGuard - hasJwtToken:', hasJwtToken, 'hasGuestSession:', hasGuestSession);
    
    // L'utilisateur peut accéder au quiz s'il a un token JWT valide ou une session invité
    if (hasJwtToken || hasGuestSession) {
      return true;
    } else {
      // Rediriger vers la page d'accueil si aucun token n'est trouvé
      this.router.navigate(['/landing']);
      return false;
    }
  }
}
