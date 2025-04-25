import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule], // Ajoute CommonModule pour éviter les erreurs *ngIf et autres
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'chatbot-mental';
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Vérifier si nous sommes à la racine et forcer la redirection vers landing page
    if (window.location.pathname === '/' || window.location.pathname === '') {
      this.router.navigate(['/landing']);
    }
  }
}
