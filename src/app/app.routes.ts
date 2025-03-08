import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige vers /login au chargement
  { path: 'login', component: LoginComponent } // Charge la page de login
];
