import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { QuizComponent } from '../quiz/quiz.component'; // ✅ Import du QuizComponent

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, QuizComponent], // ✅ Ajout de QuizComponent
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isLoginActive: boolean = true;
  username: string = '';
  password: string = '';
  passwordSignup: string = '';
  authMessage: string = '';
  showQuiz: boolean = false;

  API_URL = 'http://127.0.0.1:5000';  // 🖥️ URL du backend Flask

  constructor(private router: Router, private http: HttpClient) {}

  toggleForm(isLogin: boolean) {
    this.isLoginActive = isLogin;
    this.authMessage = ''; // Effacer le message d'erreur lors du changement de formulaire
  }

  onLogin() {
    const loginData = { username: this.username, password: this.password };

    this.http.post<any>(`${this.API_URL}/login`, loginData, { headers: { 'Content-Type': 'application/json' } })
      .pipe(
        catchError(error => {
          console.error('Login error', error);
          this.authMessage = error.error?.error || 'Login failed';
          return throwError(error);
        })
      )
      .subscribe(response => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.checkQuiz(); // ✅ Vérifier si le quiz est nécessaire
        } else {
          this.authMessage = 'Invalid credentials';
        }
      });
  }

  onSignup() {
    this.http.post('http://127.0.0.1:5000/register', {
      username: this.username,
      password: this.passwordSignup
    }).subscribe({
      next: (response) => {
        console.log('Réponse du backend:', response);
      },
      error: (err) => {
        console.error('Erreur lors du signup:', err);
      }
    });
  }

  checkQuiz() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("Aucun token trouvé après connexion");
      return;
    }

    this.http.get<any>(`${this.API_URL}/check_quiz`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe(response => {
      if (response.quiz_completed) {
        console.log("Quiz déjà complété, redirection vers /chat");
        this.router.navigate(['/chat']);
      } else {
        console.log("Quiz non complété, affichage du formulaire");
        this.showQuiz = true; // ✅ Afficher le quiz
      }
    }, error => {
      console.error("Erreur lors de la vérification du quiz:", error);
    });
  }
}
