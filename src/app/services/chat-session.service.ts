// src/app/services/chat-session.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatSessionService {
  // Historique des messages de la session en cours
  private sessionMessages: { text: string; sender: 'bot' | 'user' }[] = [];
  // Indique si la conversation a déjà été finalisée
  private conversationFinalized = false;
  // ID de la conversation sélectionnée (archivée)
  private selectedConversationId: string | null = null;
  // Compteur de mots utilisés dans la conversation
  private wordCount = 0;

  // === NOUVEAU : mode invité ===
  private guestMode = false;

  constructor() {
    // Au démarrage, on tente de restaurer le mode invité depuis le localStorage
    const stored = localStorage.getItem('guestMode');
    if (stored !== null) {
      this.guestMode = stored === 'true';
    }
  }

  // === NOUVEAU : setter/getter pour le mode invité ===

  /**
   * Active ou désactive le mode "guest".
   * On persiste ce choix dans le localStorage pour le restaurer au reload.
   */
  setGuestMode(isGuest: boolean): void {
    this.guestMode = isGuest;
    localStorage.setItem('guestMode', isGuest.toString());
  }

  /** 
   * Retourne true si on est en mode invité 
   */
  isGuestMode(): boolean {
    return this.guestMode;
  }


  // === gestion de l'historique des messages ===

  /** Sauvegarde l'historique des messages de la session */
  saveMessages(messages: { text: string; sender: 'bot' | 'user' }[]) {
    this.sessionMessages = messages;
  }

  /** Retourne l'historique des messages */
  getMessages(): { text: string; sender: 'bot' | 'user' }[] {
    return this.sessionMessages;
  }

  /** Réinitialise toute la session (messages, état, conversation sélectionnée) */
  clearSession() {
    this.sessionMessages = [];
    this.conversationFinalized = false;
    this.selectedConversationId = null;
    // On ne touche pas ici au guestMode : 
    // il reste stocké si on est invité, ou désactivé après login.
  }

  /** Marque la conversation comme finalisée ou non */
  setConversationFinalized(finalized: boolean) {
    this.conversationFinalized = finalized;
  }

  /** Indique si la conversation est finalisée */
  isConversationFinalized(): boolean {
    return this.conversationFinalized;
  }

  /** Définit l'ID de la conversation (archivée) sélectionnée */
  setConversationId(id: string | null) {
    this.selectedConversationId = id;
  }

  /** Retourne l'ID de la conversation sélectionnée */
  getConversationId(): string | null {
    return this.selectedConversationId;
  }


  // === gestion du compteur de mots ===

  /** Sauvegarde le compteur de mots */
  saveWordCount(count: number): void {
    this.wordCount = count;
  }

  /** Retourne le compteur de mots */
  getWordCount(): number {
    return this.wordCount;
  }
}
