import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss']
})
export class AccountDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
