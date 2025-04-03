import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { QuizComponent } from '../quiz/quiz.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, QuizComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoginActive: boolean = true;
  username: string = '';
  password: string = '';
  passwordSignup: string = '';
  authMessage: string = '';
  showQuiz: boolean = false;

  API_URL = 'http://127.0.0.1:5000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('jwt');
    if (token) {
      if (this.isTokenExpired(token)) {
        console.warn("Token expiré au démarrage");
        localStorage.removeItem('jwt');
        this.authMessage = "Votre session a expiré. Veuillez vous reconnecter.";
      } else {
        this.checkQuizAfterLogin();
      }
    }
  }
  

  toggleForm(isLogin: boolean) {
    this.isLoginActive = isLogin;
    this.authMessage = '';
  }

  onLogin() {
    const loginData = { username: this.username, password: this.password };

    this.http.post<any>(`${this.API_URL}/login`, loginData, {
      headers: { 'Content-Type': 'application/json' }
    })
    .pipe(
      catchError(error => {
        console.error('Login error', error);
        this.authMessage = error.error?.error || 'Login failed';
        return throwError(error);
      })
    )
    .subscribe(response => {
      if (response.access_token) {
        // Stockage du token dans localStorage avec la clé "jwt"
        localStorage.setItem('jwt', response.access_token);

        // Vérifie si l'utilisateur a déjà complété le quiz
        this.checkQuizAfterLogin();
      } else {
        this.authMessage = 'Invalid credentials';
      }
    });
  }

  onSignup() {
    this.http.post(`${this.API_URL}/register`, {
      username: this.username,
      password: this.passwordSignup
    }).subscribe({
      next: (response) => {
        console.log('Inscription réussie :', response);
      },
      error: (err) => {
        console.error('Erreur lors de l’inscription :', err);
      }
    });
  }

  /**
   * Vérifie si un token JWT est expiré
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp; // en secondes
      const now = Math.floor(Date.now() / 1000);
      return now >= expiry;
    } catch (err) {
      return true; // si erreur, on considère le token invalide
    }
  }

  /**
   * Vérifie l'état du quiz après connexion.
   */
  checkQuizAfterLogin() {
    const token = localStorage.getItem('jwt');
    if (!token) {
      this.authMessage = 'Login failed: no token found';
      return;
    }
  
    if (this.isTokenExpired(token)) {
      console.warn("⚠️ Token expiré");
    
      if (this.username && this.password) {
        console.log("🔁 Tentative de reconnexion avec identifiants...");
        this.onLogin();
      } else {
        this.authMessage = "Votre session a expiré, veuillez vous reconnecter.";
        localStorage.removeItem('jwt');
        this.zone.run(() => this.router.navigate(['/login']));
      }
      return;
    }    
  
    // 🔐 Token valide, appel API
    this.http.get<any>(`${this.API_URL}/check_quiz`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response.quiz_completed) {
          console.log("✅ Quiz complété, redirection vers /chat");
          this.zone.run(() => this.router.navigate(['/chat']));
        } else {
          console.log("📝 Quiz non complété, affichage du formulaire");
          this.showQuiz = true;
        }
      },
      error: (err) => {
        console.error("❌ Erreur lors de la vérification du quiz:", err);
        this.authMessage = err?.error?.msg || 'Unauthorized';
      }
    });
  }
  
}
