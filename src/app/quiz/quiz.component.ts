import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  providers: [CookieService]

})
export class QuizComponent implements OnInit {
  quizData: any = {
    age: '',
    gender: '',
    mental_state: '',
    physical_state: '',
    stress_level: '',
    mood: ''
  };

  API_URL = 'http://127.0.0.1:5000';  // 🔹 Flask backend URL
  
  submitting: boolean = false;
  errorMessage: string = '';
  quizCompleted: boolean = false;
  previousQuizCompleted: boolean = false;
  userInfo: any = null;
  isGuestUser: boolean = false;

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {}

  ngOnInit(): void {
    // Vérifier si c'est un utilisateur invité
    this.checkGuestUser();
    
    // Seulement pour les utilisateurs authentifiés (non invités)
    if (!this.isGuestUser) {
      this.checkIfQuizCompleted();
      this.loadUserInfo();
      this.checkPreviousQuiz();
    } else {
      console.log('Guest user detected, skipping API calls to protected endpoints');
    }
  }
  
  /**
   * Vérifie si l'utilisateur est en mode invité
   */
  checkGuestUser(): void {
    const token = this.cookieService.get('jwt');
    const guestToken = this.cookieService.get('guest_session');
    
    // C'est un utilisateur invité si: pas de token JWT ou token JWT généré pour un guest ET présence d'un cookie guest_session
    this.isGuestUser = (!token && !!guestToken) || (!!token && !!guestToken);
    console.log('Is guest user:', this.isGuestUser);
  }

  /**
   * Load user information to pre-fill age and gender
   */
  loadUserInfo(): void {
    // Ne pas appeler l'API pour les invités
    if (this.isGuestUser) {
      console.log('Guest user, skipping user info load');
      return;
    }

    const token = this.cookieService.get('jwt');
    if (!token) {
      console.log('No token found, skipping user info load');
      return;
    }

    this.http.get<any>(`${this.API_URL}/account`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response) {
          this.userInfo = response;
          console.log("User info received:", response);
          
          // If user has already completed quizzes, pre-fill age and gender
          if (response.previous_quiz_count && response.previous_quiz_count > 0) {
            this.previousQuizCompleted = true;
            if (response.age) this.quizData.age = response.age;
            if (response.gender) this.quizData.gender = response.gender;
          }
          // Some backends may directly return age and gender, use them too
          else if (response.age && response.gender) {
            this.previousQuizCompleted = true;
            this.quizData.age = response.age;
            this.quizData.gender = response.gender;
          }
        }
      },
      error: (error) => {
        console.error("Error retrieving user information:", error);
      }
    });
  }

  /**
   * Check if there are already completed quizzes on the dashboard
   */
  checkPreviousQuiz(): void {
    // Ne pas appeler l'API pour les invités
    if (this.isGuestUser) {
      console.log('Guest user, skipping previous quiz check');
      return;
    }

    const token = this.cookieService.get('jwt');
    if (!token) {
      console.log('No token found, skipping previous quiz check');
      return;
    }

    this.http.get<any>(`${this.API_URL}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        console.log("Dashboard data:", response);
        if (response && response.quiz_history && response.quiz_history.length > 0) {
          // User has already completed at least one quiz previously
          this.previousQuizCompleted = true;
          
          // Use data from the first quiz to pre-fill age and gender
          const lastQuiz = response.quiz_history[0];
          if (lastQuiz.age) this.quizData.age = lastQuiz.age;
          if (lastQuiz.gender) this.quizData.gender = lastQuiz.gender;
        }
      },
      error: (error) => {
        console.error("Error retrieving dashboard:", error);
      }
    });
  }

  /**
   * Check if the user has already completed today's quiz
   */
  checkIfQuizCompleted(): void {
    // Ne pas appeler l'API pour les invités
    if (this.isGuestUser) {
      console.log('Guest user, skipping quiz completion check');
      return;
    }

    const token = this.cookieService.get('jwt');
    if (!token) {
      console.log('No token found, skipping quiz completion check');
      return;
    }

    this.http.get<any>(`${this.API_URL}/check_quiz`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response.quiz_completed) {
          this.quizCompleted = true;
          // Automatic redirection after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/chat']);
          }, 3000);
        }
      },
      error: (error) => {
        console.error("Error checking quiz completion:", error);
      }
    });
  }

  /**
   * Validations before submitting the quiz
   */
  validateQuizData(): boolean {
    this.errorMessage = '';
    
    // Age verification for new users
    if (!this.previousQuizCompleted) {
      // Age validation
      if (!this.quizData.age) {
        this.errorMessage = "Please enter your age.";
        return false;
      }
      
      const age = parseInt(this.quizData.age, 10);
      if (isNaN(age) || age < 10 || age > 100) {
        this.errorMessage = "Please enter a valid age between 10 and 100.";
        return false;
      }
      
      // Gender validation
      if (!this.quizData.gender) {
        this.errorMessage = "Please select your gender.";
        return false;
      }
    }
    
    // Validation of other fields
    if (!this.quizData.mental_state) {
      this.errorMessage = "Please select your mental state.";
      return false;
    }
    
    if (!this.quizData.physical_state) {
      this.errorMessage = "Please select your physical state.";
      return false;
    }
    
    if (!this.quizData.stress_level) {
      this.errorMessage = "Please select your stress level.";
      return false;
    }
    
    if (!this.quizData.mood) {
      this.errorMessage = "Please select your mood.";
      return false;
    }
    
    return true;
  }

  /**
   * Submit the quiz
   */
  submitQuiz() {
    // Validate data before sending
    if (!this.validateQuizData()) {
      return;
    }
    
    this.submitting = true;
    this.errorMessage = '';
    
    const token = this.cookieService.get('jwt');
    const guestToken = this.cookieService.get('guest_session');
    
    console.log('Submit quiz - JWT token exists:', !!token);
    console.log('Submit quiz - Guest token exists:', !!guestToken);

    // Pour les invités, on crée une expérience de quiz en mode guest
    if (!token) {
      console.log("Guest user submitting quiz - redirecting to chat in 2 seconds");
      // Simuler une soumission réussie pour les invités
      this.quizCompleted = true;
      
      // Mettre la redirection dans une fonction séparée pour le déboguer plus facilement
      const navigateToChat = () => {
        console.log('Guest navigation to chat triggered');
        this.router.navigate(['/chat']).then(
          success => console.log('Navigation success:', success),
          error => console.error('Navigation error:', error)
        );
      };
      
      setTimeout(navigateToChat, 2000);
      return;
    }

    // Build the object to send
    const quizDataToSend: any = {};
    
    // For new users, include age and gender
    if (!this.previousQuizCompleted) {
      quizDataToSend.age = parseInt(this.quizData.age, 10);
      quizDataToSend.gender = this.quizData.gender;
    } else {
      // For existing users, keep age and gender if available
      if (this.quizData.age) quizDataToSend.age = parseInt(this.quizData.age, 10);
      if (this.quizData.gender) quizDataToSend.gender = this.quizData.gender;
    }
    
    // Always include other fields
    quizDataToSend.mental_state = this.quizData.mental_state;
    quizDataToSend.physical_state = this.quizData.physical_state;
    quizDataToSend.stress_level = this.quizData.stress_level;
    quizDataToSend.mood = this.quizData.mood;

    console.log("Sending quiz data:", quizDataToSend);

    this.http.post<any>(`${this.API_URL}/quiz`, quizDataToSend, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response) => {
        console.log('Quiz submitted successfully:', response);
        this.quizCompleted = true;
        // Automatic redirection after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/chat']);
        }, 2000);
      },
      error: (error) => {
        console.error("Error submitting quiz:", error);
        this.errorMessage = error.error?.error || "An error occurred while submitting the quiz.";
        if (error.status === 400 && error.error?.message === "Quiz already completed today") {
          this.quizCompleted = true;
          setTimeout(() => {
            this.router.navigate(['/chat']);
          }, 2000);
        }
        this.submitting = false;
      }
    });
  }
}
