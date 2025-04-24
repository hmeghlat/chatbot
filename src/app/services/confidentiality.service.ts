import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfidentialityService {
  private BASE_URL = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  /** 📜 Récupère la politique de confidentialité */
  getConfidentialityPolicy(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/confidentiality`);
  }
} 