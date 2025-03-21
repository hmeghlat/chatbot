import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Fournit le système de routing
    provideHttpClient(withInterceptors([]))  // Active HttpClient pour les requêtes API
  ]
}).catch(err => console.error(err));
