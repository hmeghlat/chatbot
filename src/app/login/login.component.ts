import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isLoginActive: boolean = true;
  email: string = '';
  password: string = '';
  username: string = '';
  emailSignup: string = '';
  passwordSignup: string = '';

  constructor(private router: Router) {}

  toggleForm(isLogin: boolean) {
    this.isLoginActive = isLogin;
  }

  onLogin() {
    console.log('Logging in:', this.email, this.password);
    this.router.navigate(['/chat']);
  }

  onSignup() {
    console.log('Signing up:', this.username, this.emailSignup, this.passwordSignup);
  }
}
