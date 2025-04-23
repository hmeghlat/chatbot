import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgcCookieConsent, NgcCookieConsentConfig } from 'ngx-cookieconsent';

const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: 'localhost', // Remplacez par votre domaine
  },
  palette: {
    popup: {
      background: '#000'
    },
    button: {
      background: '#f00'
    }
  },
  theme: 'edgeless',
  content: {
    message: 'Ce site utilise des cookies pour améliorer votre expérience.',
    dismiss: 'J\'accepte',
    link: 'En savoir plus',
    href: 'https://www.example.com/politique-confidentialite'
  }
};

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNgcCookieConsent(cookieConfig)
  ]
};
