import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { AuthGuard } from './guards/chat.guard';
import { GuestGuard } from './guards/guest.guard';
import { QuizComponent } from './quiz/quiz.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import {FeedComponent} from './feed/feed.component';
import { ReportsComponent } from './report/report.component';
import { JournalComponent } from './journal/journal.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingPageComponent }, // Route racine affiche directement la page d'accueil
  { path: 'landing', component: LandingPageComponent }, // Page d'accueil
  { path: 'login', component: LoginComponent },
  { path: 'quiz', component: QuizComponent, canActivate: [GuestGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'feed',component:FeedComponent },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  {path: 'journal', component:JournalComponent},

  { path: '**', redirectTo: '' } // Route fallback vers la racine
];
