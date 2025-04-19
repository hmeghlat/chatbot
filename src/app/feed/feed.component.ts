import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { trigger, style, animate, transition } from '@angular/animations';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  providers: [CookieService],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class FeedComponent implements OnInit {
  articles: { title: string, summary: SafeHtml, link: string, image?: string }[] = [];
  loading = true;
  error: string = '';
  currentPage = 1;
  articlesPerPage = 10;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.cookieService.get('jwt');
    if (!token) {
      this.error = "🔒 You are not authenticated.";
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>('http://127.0.0.1:5000/feeds', { headers }).subscribe({
      next: (res) => {
        this.articles = (res.articles || []).map((article: any) => ({
          title: article.title || 'Untitled',
          link: article.link || '#',
          summary: this.cleanAndSanitizeSummary(article.summary),
          image: article.image || null
        }));
        this.loading = false;
        this.cdr.detectChanges(); // évite NG0100 si tu as un *ngIf
      },
      error: (err) => {
        this.error = err.error?.error || '❌ Failed to load your feed.';
        this.loading = false;
      }
    });
  }

  private cleanAndSanitizeSummary(raw: string): SafeHtml {
    const text = this.stripHtml(raw || '');
    const preview = text.length > 300 ? text.slice(0, 300) + '...' : text || 'No summary available.';
    return this.sanitizer.bypassSecurityTrustHtml(preview);
  }

  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  get paginatedArticles() {
    const start = (this.currentPage - 1) * this.articlesPerPage;
    return this.articles.slice(start, start + this.articlesPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.articles.length / this.articlesPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }

  logout() {
    this.cookieService.delete('jwt');
    this.router.navigate(['/login']);
  }

  goToAccount() {
    this.router.navigate(['/chat']);
  }
}
