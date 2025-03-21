import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent {
  quizData: any = {
    age: '',
    gender: '',
    mental_state: '',
    physical_state: '',
    stress_level: '',
    mood: ''
  };

  API_URL = 'http://127.0.0.1:5000';  // 🔹 URL du backend Flask

  constructor(private http: HttpClient, private router: Router) {}

  submitQuiz() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("Impossible d'envoyer le quiz sans token");
      return;
    }

    this.http.post<any>(`${this.API_URL}/quiz`, this.quizData, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }).subscribe(response => {
      console.log('Quiz soumis avec succès:', response);
      this.router.navigate(['/chat']); // ✅ Redirection vers le chat après le quiz
    }, error => {
      console.error("Erreur lors de l'envoi du quiz:", error);
    });
  }
}
