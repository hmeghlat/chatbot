import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgcCookieConsent, NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { APP_INITIALIZER } from '@angular/core';

// Configuration améliorée pour le consentement des cookies
const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: 'localhost' // Remplacez par votre domaine
  },
  position: 'bottom-right',
  theme: 'classic',
  palette: {
    popup: {
      background: '#6A5ACD',
      text: '#ffffff',
      link: '#ffffff'
    },
    button: {
      background: '#f1d600',
      text: '#000000',
      border: 'transparent'
    }
  },
  type: 'info',
  content: {
    message: 'Ce site utilise des cookies pour améliorer votre expérience.',
    dismiss: 'J\'accepte',
    link: 'En savoir plus',
    href: 'https://www.mindhorizon.com/politique-confidentialite'
  }
};

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNgcCookieConsent(cookieConfig)
  ]
};
