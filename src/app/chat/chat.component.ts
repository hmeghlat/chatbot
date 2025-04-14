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
  imports: [CommonModule, FormsModule, MarkdownModule],
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
  typing = false;
  conversationFinalized = false;
  viewingArchived = false;

  conversationList: { conversation_id: string, timestamp: string, title?: string }[] = [];
  selectedConversationId: string | null = null;

  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngAfterViewInit(): void {
    this.loadConversations();
    this.appendBotMessage("Hello! How have you been feeling lately?");
  }

  goToFeed() {
    this.router.navigate(['/feed']);
  }

  startNewChat() {
    this.messages = [];
    this.newMessage = '';
    this.typing = false;
    this.conversationFinalized = false;
    this.viewingArchived = false;
    this.selectedConversationId = null;

    this.appendBotMessage("Hello! How have you been feeling lately?");
  }

  sendMessage(finalize: boolean = false) {
    const text = this.newMessage.trim();
    if (!text || this.conversationFinalized) return;

    this.appendUserMessage(text);
    this.newMessage = '';
    this.setTyping(true);

    this.chatService.sendMessage(text, finalize).subscribe({
      next: (res: any) => {
        this.setTyping(false);
        if (res.response) {
          this.appendBotMessage(res.response);
          if (res.final === true) {
            this.conversationFinalized = true;
          }
        } else {
          this.appendBotMessage("🤖 Sorry, I couldn't generate a response.");
        }
      },
      error: () => {
        this.setTyping(false);
        this.appendBotMessage("❌ Server error while processing your message.");
      }
    });
  }

  finalizeConversation() {
    const lastUserMessage = [...this.messages].reverse().find(msg => msg.sender === 'user');
    if (!lastUserMessage || this.conversationFinalized) return;

    this.setTyping(true);
    this.chatService.sendMessage(lastUserMessage.text, true).subscribe({
      next: (res: any) => {
        this.setTyping(false);
        if (res.response) {
          this.appendBotMessage(res.response);
          if (res.final === true) {
            this.conversationFinalized = true;
          }
        } else {
          this.appendBotMessage("🤖 Sorry, I couldn't finalize the conversation.");
        }
      },
      error: () => {
        this.setTyping(false);
        this.appendBotMessage("❌ Server error while finalizing.");
      }
    });
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

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
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

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (list) => this.conversationList = list,
      error: () => console.error("❌ Unable to fetch conversation history.")
    });
  }

  viewConversation(convId: string) {
    this.chatService.getConversationById(convId).subscribe({
      next: (conv) => {
        this.messages = conv.messages;
        this.viewingArchived = true;
        this.selectedConversationId = convId;
        this.scrollToBottom();
      },
      error: () => console.error("❌ Unable to load conversation.")
    });
  }

  exitArchivedView() {
    this.messages = [];
    this.viewingArchived = false;
    this.conversationFinalized = false;
    this.newMessage = '';
    this.selectedConversationId = null;

    this.appendBotMessage("Hello! How have you been feeling lately?");
  }
}
