import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss']
})
export class AccountDialogComponent {
  isEditing = false;
  showPasswordFields = false;
  confirmPassword = '';

  updatedAccount = {
    username: '',
    age: '',
    gender: '',
    currentPassword: '',
    newPassword: ''
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private dialogRef: MatDialogRef<AccountDialogComponent>,
    private cookieService: CookieService
  ) {
    this.updatedAccount.username = data.username;
    this.updatedAccount.age = data.age;
    this.updatedAccount.gender = data.gender;
  }

  updateAccount() {
    if (this.showPasswordFields && this.updatedAccount.newPassword !== this.confirmPassword) {
      alert('❌ Passwords do not match!');
      return;
    }

    const token = this.cookieService.get('jwt');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload: any = {};
    if (this.updatedAccount.age) payload.new_age = this.updatedAccount.age;

    if (this.showPasswordFields) {
      payload.current_password = this.updatedAccount.currentPassword;
      payload.new_password = this.updatedAccount.newPassword;
    }

    this.http.post('http://127.0.0.1:5000/account', payload, { headers }).subscribe({
      next: () => {
        alert('✅ Account updated successfully');
        this.dialogRef.close();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to update account');
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.showPasswordFields = false;
    this.updatedAccount = {
      username: this.data.username,
      age: this.data.age,
      gender: this.data.gender,
      currentPassword: '',
      newPassword: ''
    };
    this.confirmPassword = '';
  }

  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.updatedAccount.currentPassword = '';
      this.updatedAccount.newPassword = '';
      this.confirmPassword = '';
    }
  }
}
