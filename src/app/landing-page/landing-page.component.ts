import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { ConfidentialityDialogComponent } from '../components/privacy-policy.component';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpClientModule } from '@angular/common/http';


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
    private http: HttpClient
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
    if(accepted) {
      // Créer un cookie de session pour les invités
      const guestToken = `guest_${new Date().getTime()}`;
      this.cookieService.set('guest_session', guestToken, { expires: 1, path: '/' }); // Expire après 1 jour
      
      // Enregistrer l'utilisateur invité sur le serveur pour obtenir un token JWT
      this.registerGuestUser().then(() => {
        console.log('Navigating to quiz after privacy policy acceptance and guest registration');
        this.router.navigate(['/quiz']);
      }).catch(error => {
        console.error('Error during guest registration:', error);
        // Continuer vers le quiz même en cas d'erreur
        this.router.navigate(['/quiz']);
      });
    }
  }

  // Enregistrer un utilisateur invité et obtenir un token JWT
  private registerGuestUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${this.BASE_URL}/guest`, {}).subscribe({
        next: (response) => {
          if (response && response.access_token) {
            // Stocker le token JWT temporaire
            this.cookieService.set('jwt', response.access_token, { path: '/' });
            console.log('Guest token registered and stored');
            resolve();
          } else {
            console.warn('Guest registration response did not contain access_token', response);
            resolve(); // Continuer même si le format de la réponse n'est pas celui attendu
          }
        },
        error: (error) => {
          console.error('Failed to register guest user:', error);
          reject(error);
        }
      });
    });
  }
}
