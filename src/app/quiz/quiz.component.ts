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

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {}

  ngOnInit(): void {
    this.checkIfQuizCompleted();
    this.loadUserInfo();
    this.checkPreviousQuiz();
  }

  /**
   * Load user information to pre-fill age and gender
   */
  loadUserInfo(): void {
    const token = this.cookieService.get('jwt');
    if (!token) {
      this.router.navigate(['/login']);
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
    const token = this.cookieService.get('jwt');
    if (!token || token.startsWith('guest_')) {
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
    const token = this.cookieService.get('jwt');
    if (!token) {
      this.router.navigate(['/login']);
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

    if (!token) {
      this.errorMessage = "Unable to send quiz without token";
      this.submitting = false;
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
