import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  articles: { title: string, summary: SafeHtml, link: string }[] = [];
  loading = true;
  error: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (!token) {
      this.error = "Not authenticated";
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://127.0.0.1:5000/feeds', { headers }).subscribe({
      next: (res) => {
        this.articles = (res.articles || []).map((article: any) => ({
          title: article.title || 'Untitled',
          link: article.link || '#',
          summary: this.cleanAndSanitizeSummary(article.summary)
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load feed';
        this.loading = false;
      }
    });
  }

  /**
   * Nettoie et sécurise un résumé HTML avant de l'afficher
   */
  private cleanAndSanitizeSummary(raw: string): SafeHtml {
    if (!raw) return 'No summary available.';
    const cleanText = this.stripHtml(raw).slice(0, 300) + '...';
    return this.sanitizer.bypassSecurityTrustHtml(cleanText);
  }

  /**
   * Supprime toutes les balises HTML d'une string
   */
  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }
}
