import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ConfidentialityService } from '../services/confidentiality.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confidentiality-dialog',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // 👈 n'oublie pas ça !
  ],
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
        this.policyText = 'Error loading privacy policy. Please try again later.';
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
