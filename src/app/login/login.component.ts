import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { QuizComponent } from '../quiz/quiz.component';
import { ConfidentialityDialogComponent } from '../components/privacy-policy.component';
import { CookieService } from 'ngx-cookie-service';
import { ChatSessionService } from '../services/chat-session.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, QuizComponent, ConfidentialityDialogComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [CookieService]
})
export class LoginComponent implements OnInit {
  isLoginActive = true;
  username = '';
  password = '';
  passwordSignup = '';
  authMessage = '';
  showQuiz = false;
  acceptedPolicy = false;
  showConfidentialityPolicy = false;

  API_URL = 'http://127.0.0.1:5000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private zone: NgZone,
    private cookieService: CookieService,
    private sessionService: ChatSessionService
  ) {}

  ngOnInit() {
    const token = this.cookieService.get('jwt');
    if (token && !this.isTokenExpired(token)) {
      this.checkQuizAfterLogin();
    } else {
      this.cookieService.delete('jwt');
    }
  }

  toggleForm(isLogin: boolean) {
    this.isLoginActive = isLogin;
    this.authMessage = '';
    this.username = '';
    this.password = '';
    this.passwordSignup = '';
    this.acceptedPolicy = false;
  }

  onLogin() {
    const loginData = { username: this.username, password: this.password };

    this.http.post<any>(`${this.API_URL}/login`, loginData, {
      headers: { 'Content-Type': 'application/json' }
    })
    .pipe(catchError(error => {
      console.error('Login error', error);
      this.authMessage = error.error?.error || 'Login failed';
      return throwError(error);
    }))
    .subscribe(response => {
      if (response.access_token) {
        this.cookieService.set('jwt', response.access_token, { sameSite: 'Lax', secure: true, path: '/' });
        this.sessionService.setGuestMode(false);
        this.checkQuizAfterLogin();
        

      } else {
        this.authMessage = 'Invalid credentials';
      }
    });
  }

  initiateSignup() {
    if (!this.acceptedPolicy) {
      this.viewPrivacyPolicy();
    } else {
      this.onSignup();
    }
  }

  onConfidentialityResponse(accepted: boolean) {
    this.showConfidentialityPolicy = false;
    if (accepted) {
      this.acceptedPolicy = true;
      this.onSignup();
    } else {
      this.authMessage = "You must accept the privacy policy to sign up.";
    }
  }

  onSignup() {
    this.http.post(`${this.API_URL}/register`, {
      username: this.username,
      password: this.passwordSignup,
      accepted_confidentiality: true
    }).subscribe({
      next: (response: any) => {
        this.authMessage = "✅ Account created! Please log in.";
        this.isLoginActive = true;
        this.username = '';
        this.passwordSignup = '';
        this.acceptedPolicy = false;
      },
      error: (err) => {
        console.error("Signup error:", err);
        this.authMessage = err.error?.error || "Signup error";
      }
    });
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Math.floor(Date.now() / 1000) >= payload.exp;
    } catch {
      return true;
    }
  }

  checkQuizAfterLogin() {
    const token = this.cookieService.get('jwt');
    if (!token) return;

    this.http.get<any>(`${this.API_URL}/check_quiz`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        if (res.quiz_completed) {
          this.zone.run(() => this.router.navigate(['/chat']));
        } else {
          this.showQuiz = true;
        }
      },
      error: (err) => {
        console.error("Quiz check error:", err);
        this.authMessage = err?.error?.msg || 'Unauthorized';
      }
    });
  }

  viewPrivacyPolicy() {
    this.showConfidentialityPolicy = true;
  }
}
