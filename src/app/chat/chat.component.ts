import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: { text: string, sender: 'bot' | 'user' }[] = [];
  newMessage: string = '';
  responses: string[] = [];
  phase = 1;
  generatedQuestions: string[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
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
    this.appendBotMessage("🤖 Generating personalized questions based on your answers...");

    this.chatService.generateQuestions(this.responses).subscribe({
      next: (res: any) => {
        if (res.questions && res.questions.length) {
          this.generatedQuestions = res.questions;
          this.phase = 2;
          setTimeout(() => this.appendBotMessage(this.generatedQuestions[0]), 1000);
        } else {
          this.appendBotMessage("❌ Error generating questions.");
        }
      },
      error: () => this.appendBotMessage("❌ Server error while generating questions.")
    });
  }

  private analyzeResponses() {
    this.appendBotMessage("🔍 Analyzing your responses...");

    this.chatService.analyzeResponses(this.responses).subscribe({
      next: (res: any) => {
        if (res.diagnosis && res.deepseek_response) {
          this.appendBotMessage(`🧠 Diagnosis: ${res.diagnosis}`);
          setTimeout(() => this.appendBotMessage(`🤖 ${res.deepseek_response}`), 1000);
        } else {
          this.appendBotMessage("❌ Error: Missing data from the analysis.");
        }
      },
      error: () => this.appendBotMessage("❌ Server error while analyzing responses.")
    });
  }

  private appendBotMessage(text: string) {
    this.messages.push({ text, sender: 'bot' });
  }

  private appendUserMessage(text: string) {
    this.messages.push({ text, sender: 'user' });
  }
}
