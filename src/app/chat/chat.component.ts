import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { ChatService } from '../services/chat.service';
import { ReportService } from '../services/report.service';
import { ChatSessionService } from '../services/chat-session.service';
import { AccountDialogComponent } from '../account-dialog/account-dialog.component';

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
export class ChatComponent implements OnInit, AfterContentInit, AfterViewInit {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;

  messages: { text: string; sender: 'bot' | 'user' }[] = [];
  newMessage = '';
  typing = false;
  conversationFinalized = false;
  viewingArchived = false;
  generatingReport = false;

  conversationList: { conversation_id: string; timestamp: string; title?: string }[] = [];
  selectedConversationId: string | null = null;

  wordLimit = 400;
  wordCount = 0;

  constructor(
    private chatService: ChatService,
    private reportService: ReportService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private sessionService: ChatSessionService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  /** 1. On restore tout en OnInit */
  ngOnInit(): void {
    this.messages = this.sessionService.getMessages();
    this.wordCount = this.sessionService.getWordCount();
    this.conversationFinalized = this.sessionService.isConversationFinalized();
    this.selectedConversationId = this.sessionService.getConversationId();
  }

  /** 2. On injecte *seulement* le message de bienvenue ici */
  ngAfterContentInit(): void {
    if (this.messages.length === 0) {
      // micro‑tâche pour éviter NG0100
      Promise.resolve().then(() => this._appendBotMessage(
        "Hello! How have you been feeling lately?"
      ));
    }
  }

  /** 3. Après que le contenu est monté, on scroll et on charge l’historique */
  ngAfterViewInit(): void {
    this._scrollToBottom();
    this.loadConversations();
  }

  get remainingWords(): number {
    return Math.max(0, this.wordLimit - this.wordCount);
  }

  goToFeed() {
    this._saveSession();
    this.router.navigate(['/feed']);
  }

  goToReports() {
    this._saveSession();
    this.router.navigate(['/reports']);
  }

  startNewChat() {
    this.sessionService.clearSession();
    this.messages = [];
    this.newMessage = '';
    this.typing = false;
    this.conversationFinalized = false;
    this.viewingArchived = false;
    this.selectedConversationId = null;
    this.wordCount = 0;
    Promise.resolve().then(() =>
      this._appendBotMessage("Hello! How have you been feeling lately?")
    );
  }

  sendMessage(finalize: boolean = false) {
    const text = this.newMessage.trim();
    if (!text || this.conversationFinalized) return;

    const wc = text.split(/\s+/).length;
    if (this.wordCount + wc > this.wordLimit) {
      this._appendBotMessage("⚠️ You've reached the 400‑word limit.");
      return;
    }

    this._appendUserMessage(text);
    this.newMessage = '';
    this.typing = true;

    this.chatService.sendMessage(text, finalize).subscribe({
      next: res => {
        this.typing = false;
        if (res.response) {
          this._appendBotMessage(res.response);
          if (res.final) {
            this.conversationFinalized = true;
            if (res.conversation_id) {
              this.selectedConversationId = res.conversation_id;
              this.loadConversations();
            }
          }
        } else {
          this._appendBotMessage("🤖 Sorry, I couldn't generate a response.");
        }
        this._saveSession();
      },
      error: () => {
        this.typing = false;
        this._appendBotMessage("❌ Server error while processing your message.");
        this._saveSession();
      }
    });
  }

  finalizeConversation() {
    const last = [...this.messages].reverse().find(m => m.sender === 'user');
    if (!last || this.conversationFinalized) return;

    this.typing = true;
    this.chatService.sendMessage(last.text, true).subscribe({
      next: res => {
        this.typing = false;
        if (res.response) {
          this._appendBotMessage(res.response);
          if (res.final) {
            this.conversationFinalized = true;
            if (res.conversation_id) {
              this.selectedConversationId = res.conversation_id;
              this.loadConversations();
            }
          }
        } else {
          this._appendBotMessage("❌ Failed to finalize the conversation.");
        }
        this._saveSession();
      },
      error: () => {
        this.typing = false;
        this._appendBotMessage("❌ Server error while finalizing.");
        this._saveSession();
      }
    });
  }

  generateConversationReport() {
    if (!this.selectedConversationId || !this.conversationFinalized) return;
    this.generatingReport = true;
    this._appendBotMessage("⏳ Generating report…");
    this.reportService.generateConversationReport(this.selectedConversationId)
      .subscribe({
        next: blob => {
          this.reportService.downloadReport(
            blob,
            `conversation_${this.selectedConversationId}.pdf`
          );
          this._appendBotMessage("✅ Report downloaded!");
          this.generatingReport = false;
        },
        error: () => {
          this.generatingReport = false;
          this._appendBotMessage("❌ Failed to generate report.");
        }
      });
  }

  generateGeneralReport() {
    this.generatingReport = true;
    this._appendBotMessage("⏳ Generating general report…");
    this.reportService.generateGeneralReport().subscribe({
      next: blob => {
        this.reportService.downloadReport(blob, `general_report.pdf`);
        this._appendBotMessage("✅ General report downloaded!");
        this.generatingReport = false;
      },
      error: () => {
        this.generatingReport = false;
        this._appendBotMessage("❌ Failed to generate general report.");
      }
    });
  }

  openAccountDialog() {
    const token = this.cookieService.get('jwt');
    if (!token) return;
    this.http.get<any>('http://127.0.0.1:5000/account', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(userInfo => {
      this.dialog.open(AccountDialogComponent, { data: userInfo });
    });
  }

  viewConversation(convId: string) {
    this.chatService.getConversationById(convId).subscribe({
      next: conv => {
        this.messages = conv.messages;
        this.selectedConversationId = convId;
        this.viewingArchived = true;
        this.conversationFinalized = true;
        this.cdr.detectChanges();
        this._scrollToBottom();
      },
      error: () => console.error("Unable to load conversation.")
    });
  }

  exitArchivedView() {
    this.startNewChat();
  }

  logout() {
    this.cookieService.delete('jwt');
    this.router.navigate(['/login']);
  }

  private loadConversations() {
    this.chatService.getConversations().subscribe({
      next: list => {
        this.conversationList = list;
        this.cdr.detectChanges();
      },
      error: () => console.error("Unable to fetch conversation history.")
    });
  }

  private _scrollToBottom() {
    setTimeout(() => {
      const c = this.chatMessagesRef.nativeElement;
      c.scrollTop = c.scrollHeight;
    }, 50);
  }

  private _appendBotMessage(text: string) {
    this.messages.push({ text, sender: 'bot' });
    this.cdr.detectChanges();
    this._scrollToBottom();
  }

  private _appendUserMessage(text: string) {
    this.wordCount += text.split(/\s+/).length;
    this.messages.push({ text, sender: 'user' });
    this.cdr.detectChanges();
    this._scrollToBottom();
  }

  private _saveSession() {
    this.sessionService.saveMessages(this.messages);
    this.sessionService.setConversationFinalized(this.conversationFinalized);
    this.sessionService.setConversationId(this.selectedConversationId);
    this.sessionService.saveWordCount(this.wordCount);
  }
}
