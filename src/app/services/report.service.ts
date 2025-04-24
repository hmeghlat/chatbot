import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private BASE_URL = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  /** 🔐 Génère les headers avec le JWT depuis les cookies */
  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('jwt');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  generateGeneralReport(): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/account/report/general`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob' as 'json'
    }) as Observable<Blob>;
  }

  generateConversationReport(convId: string): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/conversations/${convId}/report`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob' as 'json'
    }) as Observable<Blob>;
  }

  downloadReport(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  }
}
