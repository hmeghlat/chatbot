import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfidentialityService } from '../services/confidentiality.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-confidentiality-dialog',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [ConfidentialityService]
})
export class ConfidentialityDialogComponent implements OnInit {
  policyText: string = '';
  agreed: boolean = false;

  @Output() accepted = new EventEmitter<boolean>();

  constructor(private confidentialityService: ConfidentialityService) {}

  ngOnInit(): void {
    this.loadPolicy();
  }

  loadPolicy(): void {
    this.confidentialityService.getConfidentialityPolicy().subscribe(
      response => {
        this.policyText = response.confidentiality.replace(/\n/g, '<br>');
      },
      error => {
        console.error('Error loading privacy policy', error);
        this.policyText = 'En utilisant notre plateforme, vous acceptez notre politique de confidentialité qui garantit la protection de vos données personnelles. Nous utilisons vos données uniquement pour améliorer votre expérience et nous ne les partageons jamais avec des tiers sans votre consentement explicite.';
      }
    );
  }

  onAccept(): void {
    this.accepted.emit(true);
  }

  onDecline(): void {
    this.accepted.emit(false);
  }
}
