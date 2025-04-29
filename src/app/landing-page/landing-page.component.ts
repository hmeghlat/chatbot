import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { ConfidentialityDialogComponent } from '../components/privacy-policy.component';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChatSessionService } from '../services/chat-session.service';


@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  imports: [
    NgIf,
    FormsModule,
    ConfidentialityDialogComponent,
    HttpClientModule
  ],
  providers: [CookieService],
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  isNavbarScrolled = false;
  isMobileMenuOpen = false;
  showPrivacyPolicyDialog = false;
  private BASE_URL = 'http://127.0.0.1:5000';

  constructor(
    private router: Router, 
    private cookieService: CookieService,
    private http: HttpClient,
    private sessionService: ChatSessionService
  ) { }

  ngOnInit() {
    this.checkSections();
    window.addEventListener('scroll', () => {
      this.isNavbarScrolled = window.scrollY > 50;
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    // Navbar scroll effect
    this.isNavbarScrolled = window.scrollY > 50;
    
    // Check sections visibility
    this.checkSections();
  }

  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Hauteur de la navbar + marge
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Fermer le menu mobile si ouvert
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  private checkSections() {
    const sections = document.querySelectorAll('.presentation, .features, .testimonials');
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isVisible = (rect.top <= window.innerHeight * 0.75);
      
      if (isVisible) {
        section.classList.add('visible');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  requestRules() {
    this.showPrivacyPolicyDialog = true;
  }

  onPrivacyPolicyResponse(accepted: boolean) {
    this.showPrivacyPolicyDialog = false;
    if (accepted) {
      // 1) Créer un cookie de session pour le front (facultatif)
      const guestToken = `guest_${Date.now()}`;
      this.cookieService.set('guest_session', guestToken, { expires: 1, path: '/' });

      // 2) Enregistrer l'utilisateur invité côté back (pour obtenir JWT)
      this.registerGuestUser()
        .then(() => {
          // 3) Passer le ChatSessionService en mode “guest”
          this.sessionService.setGuestMode(true);       // ←
          // 4) Naviguer
          this.router.navigate(['/quiz']);
        })
        .catch(_ => {
          // même en cas d’erreur, on reste en guest
          this.sessionService.setGuestMode(true);       // ←
          this.router.navigate(['/quiz']);
        });
    }
  }


  // Enregistrer un utilisateur invité et obtenir un token JWT
  private registerGuestUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${this.BASE_URL}/guest`, {}).subscribe({
        next: resp => {
          if (resp.access_token) {
            this.cookieService.set('jwt', resp.access_token, { path: '/' });
            this.sessionService.setGuestMode(true);
          }
          resolve();
        },
        error: err => reject(err)
      });
    });
  }
}
