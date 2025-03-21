import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { AuthGuard } from './guards/chat.guard'; 
import { QuizComponent } from './quiz/quiz.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige vers /login au chargement
  { path: 'login', component: LoginComponent }, // Page de connexion
  { path: 'quiz', component: QuizComponent },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] }, // ✅ Protège l'accès au chat avec le Guard

  { path: '**', redirectTo: 'login' } // Gère les routes inexistantes
];
