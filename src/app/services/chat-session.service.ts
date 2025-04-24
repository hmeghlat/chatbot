import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatSessionService {
  private sessionMessages: { text: string, sender: 'bot' | 'user' }[] = [];
  private conversationFinalized: boolean = false;
  private selectedConversationId: string | null = null;
  private wordCount: number = 0;

  constructor() {}

  saveMessages(messages: { text: string, sender: 'bot' | 'user' }[]) {
    this.sessionMessages = messages;
  }

  getMessages(): { text: string, sender: 'bot' | 'user' }[] {
    return this.sessionMessages;
  }

  clearSession() {
    this.sessionMessages = [];
    this.conversationFinalized = false;
    this.selectedConversationId = null;
  }

  setConversationFinalized(finalized: boolean) {
    this.conversationFinalized = finalized;
  }

  isConversationFinalized(): boolean {
    return this.conversationFinalized;
  }

  setConversationId(id: string | null) {
    this.selectedConversationId = id;
  }

  getConversationId(): string | null {
    return this.selectedConversationId;
  }

  saveWordCount(count: number): void {
    this.wordCount = count;
  }
  
  getWordCount(): number {
    return this.wordCount;
  }
}
