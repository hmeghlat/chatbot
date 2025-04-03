import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { MarkdownModule } from 'ngx-markdown';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule, // ✅ Ajouté pour MarkdownService
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ChatComponent implements AfterViewInit {
  messages: { text: string, sender: 'bot' | 'user' }[] = [];
  newMessage: string = '';
  responses: string[] = [];
  phase = 1;
  generatedQuestions: string[] = [];
  typing = false;

  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;

  constructor(private chatService: ChatService,private router: Router,private dialog: MatDialog, private http: HttpClient) {}

  goToFeed() {
    this.router.navigate(['/feed']);
  }

  ngAfterViewInit(): void {
    this.appendBotMessage("Hello! How have you been feeling lately?");
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text) return;

    this.appendUserMessage(text);
    this.responses.push(text);
    this.newMessage = '';

    if (this.phase === 1) {
      if (this.responses.length === 1) {
        setTimeout(() => this.appendBotMessage("Do you have trouble sleeping?"), 1000);
      } else {
        this.generateQuestions();
      }
    } else if (this.phase === 2) {
      if (this.responses.length >= 5) {
        this.analyzeResponses();
      } else {
        const nextQuestion = this.generatedQuestions[this.responses.length - 2];
        setTimeout(() => this.appendBotMessage(nextQuestion), 1000);
      }
    }
  }

  private generateQuestions() {
    this.setTyping(true);
    this.chatService.generateQuestions(this.responses).subscribe({
      next: (res: any) => {
        this.setTyping(false);
        if (res.questions?.length) {
          this.generatedQuestions = res.questions;
          this.phase = 2;
          setTimeout(() => this.appendBotMessage(this.generatedQuestions[0]), 1000);
        } else {
          this.appendBotMessage("❌ Error generating questions.");
        }
      },
      error: () => {
        this.setTyping(false);
        this.appendBotMessage("❌ Server error while generating questions.");
      }
    });
  }

  private analyzeResponses() {
    this.setTyping(true);
    this.chatService.analyzeResponses(this.responses).subscribe({
      next: (res: any) => {
        this.setTyping(false);
        if (res.diagnosis && res.deepseek_response) {
          this.appendBotMessage(`🧠 **Diagnosis:** ${res.diagnosis}`);
          setTimeout(() => this.appendBotMessage(`🤖 ${res.deepseek_response}`), 1000);
        } else {
          this.appendBotMessage("❌ Error: Missing data from the analysis.");
        }
      },
      error: () => {
        this.setTyping(false);
        this.appendBotMessage("❌ Server error while analyzing responses.");
      }
    });
  }

  logout() {
    localStorage.removeItem('jwt'); // 🔐 Supprimer le token
    this.router.navigate(['/login']); // 🚪 Rediriger vers login
  }

  private appendBotMessage(text: string) {
    this.messages.push({ text, sender: 'bot' });
    this.scrollToBottom();
  }

  private appendUserMessage(text: string) {
    this.messages.push({ text, sender: 'user' });
    this.scrollToBottom();
  }

  private setTyping(value: boolean) {
    this.typing = value;
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatMessagesRef) {
        const container = this.chatMessagesRef.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  openAccountDialog() {
    const token = localStorage.getItem('jwt');
    if (!token) return;
  
    this.http.get<any>('http://127.0.0.1:5000/account', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (userInfo) => {
        this.dialog.open(AccountDialogComponent, {
          data: userInfo
        });
      },
      error: (err) => {
        console.error('Failed to fetch account info:', err);
      }
    });
  }
  
}
