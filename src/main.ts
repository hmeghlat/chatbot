import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CookieService } from 'ngx-cookie-service';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Fournit le système de routing
    provideHttpClient(withInterceptors([])),  // Active HttpClient pour les requêtes API
    provideAnimations(), // ✅ Nécessaire pour @fadeIn
    importProvidersFrom(MarkdownModule.forRoot()), provideAnimationsAsync(),
    CookieService
  ]
}).catch(err => console.error(err));
