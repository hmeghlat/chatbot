import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  isNavbarScrolled = false;
  isMobileMenuOpen = false;

  constructor(private router: Router) { }

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
}
