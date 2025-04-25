import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CookieService } from 'ngx-cookie-service';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,  // Utilisation de la configuration de app.config.ts
    provideHttpClient(),  // Active HttpClient pour les requêtes API
    provideAnimations(), // ✅ Nécessaire pour @fadeIn
    importProvidersFrom(MarkdownModule.forRoot()),
    provideAnimationsAsync(),
    CookieService
  ]
}).catch(err => console.error(err));
