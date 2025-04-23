import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  imports: [
    NgIf,
    FormsModule
  ],
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {

  showRgpdModal = false;
  rgpdAccepted = false;

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  requestRules() {
    this.showRgpdModal = true;
  }

  validateRgpd() {
    if(this.rgpdAccepted) {
      this.router.navigate(['/quizz']);
      this.showRgpdModal = false;
    }
  }
}
