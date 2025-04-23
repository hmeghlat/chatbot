import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: NgcCookieConsentService
  ) {}

  canActivate(): boolean {
    if (this.cookieService.hasConsented()) {
      return true; // L'utilisateur a accepté le RGPD
    } else {
      this.router.navigate(['/']); // Redirige vers la landing page
      return false;
    }
  }
}
