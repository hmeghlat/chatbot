import {Component,ElementRef,ViewChild,OnInit,AfterContentInit,AfterViewInit,ChangeDetectorRef,NgZone} from '@angular/core';
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


// 1) Déclare le format d’un message dans une conversation
interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}


export interface ConversationDetail {
  messages: ChatMessage[];
  // si ton API renvoie d’autres champs, tu peux les lister ici
}
// 1) Structure brute renvoyée par ton API /conversations
interface RawConversation {
  conversation_id: string;
  timestamp:       string;
}

// 2) Structure finale pour la sidebar (on y ajoute 'title')
interface ConversationSidebarItem extends RawConversation {
  title: string;
}


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
  


  conversationList: ConversationSidebarItem[] = [];


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

  public get isGuest(): boolean {
    return this.sessionService.isGuestMode();
  }
  /** 1. On restore tout en OnInit */
  ngOnInit(): void {
    // 1) Restaurer l’état de la session (messages + état finalize)
    this.messages               = this.sessionService.getMessages();
    this.conversationFinalized  = this.sessionService.isConversationFinalized();
    this.selectedConversationId = this.sessionService.getConversationId();
    this.wordCount              = this.sessionService.getWordCount();
  
    // 2) Si on est en mode invité, injecter un message d’avertissement
    if (this.sessionService.isGuestMode()) {
      this._appendBotMessage(
        "👋 Welcome! You're in guest mode – your chats won't be saved."
      );
    }
  }

  /** 2. On injecte *seulement* le message de bienvenue ici */
  ngAfterContentInit(): void {
    if (this.messages.length === 0) {
      Promise.resolve().then(() =>
        this._appendBotMessage("Hello! How have you been feeling lately?")
      );
    }
  }

  /** 3. Après que le contenu est monté, on scroll et on charge l'historique */
  ngAfterViewInit(): void {
    this._scrollToBottom();
    const token = this.cookieService.get('jwt');
    const guest = this.cookieService.get('guest_session');

    // Si guest, on ne recharge pas l’historique
    if (!token && guest) {
      console.log('Guest user – skipping history load');
    } else {
      this.loadConversations();
    }
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

  goToJournal() {
    this._saveSession();
    this.router.navigate(['/journal']);
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
      this._appendBotMessage("⚠️ You've reached the 400-word limit.");
      return;
    }

    this._appendUserMessage(text);
    this.newMessage = '';
    this.typing = true;

    this.chatService.sendMessage(text, finalize).subscribe({
      next: (res) => {
        this.typing = false;
        if (res.response) {
          this._appendBotMessage(res.response);
          if (res.final) {
            this.conversationFinalized = true;
            if (res.conversation_id) {
              this.selectedConversationId = res.conversation_id;
              const isGuest = !this.cookieService.get('jwt') && !!this.cookieService.get('guest_session');
              if (!isGuest) {
                this.loadConversations();
              }
            }
          }
        } else {
          this._appendBotMessage("🤖 Sorry, I couldn't generate a response.");
        }
        this._saveSession();
      },
      error: (err) => {
        console.error("Error sending message:", err);
        this.typing = false;
        const isGuest = !this.cookieService.get('jwt') && !!this.cookieService.get('guest_session');
        if (isGuest) {
          this._appendBotMessage(
            "I'm here to help! As a guest user, you can chat with me here, but to save conversations and access other features, please sign up for an account."
          );
        } else {
          this._appendBotMessage("❌ Server error while processing your message.");
        }
        this._saveSession();
      }
    });
  }

  finalizeConversation() {
    const last = [...this.messages].reverse().find(m => m.sender === 'user');
    if (!last || this.conversationFinalized) return;

    this.typing = true;
    this.chatService.sendMessage(last.text, true).subscribe({
      next: (res) => {
        this.typing = false;
        if (res.response) {
          this._appendBotMessage(res.response);
          if (res.final) {
            this.conversationFinalized = true;
            if (res.conversation_id) {
              this.selectedConversationId = res.conversation_id;
              const isGuest = !this.cookieService.get('jwt') && !!this.cookieService.get('guest_session');
              if (!isGuest) {
                this.loadConversations();
              }
            }
          }
        } else {
          this._appendBotMessage("❌ Failed to finalize the conversation.");
        }
        this._saveSession();
      },
      error: (err) => {
        console.error("Error finalizing conversation:", err);
        this.typing = false;
        const isGuest = !this.cookieService.get('jwt') && !!this.cookieService.get('guest_session');
        if (isGuest) {
          this._appendBotMessage(
            "Thank you for chatting! To save this conversation, please sign up for an account."
          );
          this.conversationFinalized = true;
        } else {
          this._appendBotMessage("❌ Server error while finalizing.");
        }
        this._saveSession();
      }
    });
  }

  generateConversationReport() {
    if (!this.selectedConversationId || !this.conversationFinalized) return;
    this.generatingReport = true;
    this._appendBotMessage("⏳ Generating report…");
    this.reportService.generateConversationReport(this.selectedConversationId).subscribe({
      next: (blob) => {
        this.reportService.downloadReport(blob, `conversation_${this.selectedConversationId}.pdf`);
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
      next: (blob) => {
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
    }).subscribe((userInfo) => {
      this.dialog.open(AccountDialogComponent, { data: userInfo });
    });
  }

  viewConversation(convId: string) {
    this.chatService.getConversationById(convId).subscribe({
      next: (conv) => {
        this.messages = conv.messages;
        const greeting = "Hello! How have you been feeling lately?";
        if (
          this.messages.length === 0 ||
          this.messages[0].sender !== 'bot' ||
          this.messages[0].text   !== greeting
        ) {
          this.messages.unshift({ text: greeting, sender: 'bot' });
        }
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
    this.router.navigate(['/landing']);
  }

  private loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (list: RawConversation[]) => {
        this.conversationList = list.map(item => ({
          conversation_id: item.conversation_id,
          timestamp:       item.timestamp,
          title:           ''
        }));

        this.conversationList.forEach((conv, idx) => {
          this.chatService.getConversationById(conv.conversation_id)
            .subscribe({
              next: (fullConv: { messages: ChatMessage[] }) => {
                const firstUser = fullConv.messages.find(m => m.sender === 'user');
                if (firstUser) {
                  const snippet = firstUser.text.length > 30
                    ? firstUser.text.slice(0, 30).trim() + '…'
                    : firstUser.text;
                  this.conversationList[idx].title = snippet;
                } else {
                  this.conversationList[idx].title =
                    new Date(conv.timestamp).toLocaleDateString();
                }
                this.cdr.detectChanges();
              },
              error: () => {
                this.conversationList[idx].title =
                  new Date(conv.timestamp).toLocaleDateString();
                this.cdr.detectChanges();
              }
            });
        });
      },
      error: err => {
        console.error('Unable to fetch conversation history:', err);
        this.conversationList = [];
      }
    });
  }


  private _scrollToBottom() {
    setTimeout(() => {
      const c = this.chatMessagesRef.nativeElement;
      c.scrollTop = c.scrollHeight;
    }, 50);
  }

  private _appendBotMessage(text: string) {
    // Nettoyer le message en retirant les préfixes "user :" ou "bot :"
    const cleanedText = text.replace(/^(user|bot)\s*:\s*/i, '');
    this.messages.push({ text: cleanedText, sender: 'bot' });
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
